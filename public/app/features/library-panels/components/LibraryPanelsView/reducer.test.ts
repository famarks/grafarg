import { LoadingState } from '@grafarg/data';

import { reducerTester } from '../../../../../test/core/redux/reducerTester';
import {
  changePage,
  changeSearchString,
  initialLibraryPanelsViewState,
  initSearch,
  libraryPanelsViewReducer,
  LibraryPanelsViewState,
  searchCompleted,
} from './reducer';
import { LibraryPanelDTO } from '../../types';

describe('libraryPanelsViewReducer', () => {
  describe('when initSearch is dispatched', () => {
    it('then the state should be correct', () => {
      reducerTester<LibraryPanelsViewState>()
        .givenReducer(libraryPanelsViewReducer, { ...initialLibraryPanelsViewState })
        .whenActionIsDispatched(initSearch())
        .thenStateShouldEqual({
          ...initialLibraryPanelsViewState,
          loadingState: LoadingState.Loading,
        });
    });
  });

  describe('when searchCompleted is dispatched', () => {
    it('then the state should be correct', () => {
      const payload = {
        perPage: 10,
        page: 3,
        libraryPanels: getLibraryPanelMocks(2),
        totalCount: 200,
      };

      reducerTester<LibraryPanelsViewState>()
        .givenReducer(libraryPanelsViewReducer, { ...initialLibraryPanelsViewState })
        .whenActionIsDispatched(searchCompleted(payload))
        .thenStateShouldEqual({
          ...initialLibraryPanelsViewState,
          perPage: 10,
          page: 3,
          libraryPanels: payload.libraryPanels,
          totalCount: 200,
          loadingState: LoadingState.Done,
          numberOfPages: 20,
        });
    });

    describe('and page is greater than the current number of pages', () => {
      it('then the state should be correct', () => {
        const payload = {
          perPage: 10,
          page: 21,
          libraryPanels: getLibraryPanelMocks(2),
          totalCount: 200,
        };

        reducerTester<LibraryPanelsViewState>()
          .givenReducer(libraryPanelsViewReducer, { ...initialLibraryPanelsViewState })
          .whenActionIsDispatched(searchCompleted(payload))
          .thenStateShouldEqual({
            ...initialLibraryPanelsViewState,
            perPage: 10,
            page: 20,
            libraryPanels: payload.libraryPanels,
            totalCount: 200,
            loadingState: LoadingState.Done,
            numberOfPages: 20,
          });
      });
    });
  });

  describe('when changeSearchString is dispatched', () => {
    it('then the state should be correct', () => {
      reducerTester<LibraryPanelsViewState>()
        .givenReducer(libraryPanelsViewReducer, { ...initialLibraryPanelsViewState })
        .whenActionIsDispatched(changeSearchString({ searchString: 'a search string' }))
        .thenStateShouldEqual({
          ...initialLibraryPanelsViewState,
          searchString: 'a search string',
        });
    });
  });

  describe('when changePage is dispatched', () => {
    it('then the state should be correct', () => {
      reducerTester<LibraryPanelsViewState>()
        .givenReducer(libraryPanelsViewReducer, { ...initialLibraryPanelsViewState })
        .whenActionIsDispatched(changePage({ page: 42 }))
        .thenStateShouldEqual({
          ...initialLibraryPanelsViewState,
          page: 42,
        });
    });
  });
});

function getLibraryPanelMocks(count: number): LibraryPanelDTO[] {
  const mocks: LibraryPanelDTO[] = [];

  for (let i = 0; i < count; i++) {
    mocks.push(
      mockLibraryPanel({
        uid: i.toString(10),
        id: i,
        name: `Test Panel ${i}`,
      })
    );
  }

  return mocks;
}

function mockLibraryPanel({
  uid = '1',
  id = 1,
  orgId = 1,
  folderId = 0,
  name = 'Test Panel',
  model = { type: 'text', title: 'Test Panel' },
  meta = {
    canEdit: true,
    connectedDashboards: 0,
    created: '2021-01-01T00:00:00',
    createdBy: { id: 1, name: 'User X', avatarUrl: '/avatar/abc' },
    updated: '2021-01-02T00:00:00',
    updatedBy: { id: 2, name: 'User Y', avatarUrl: '/avatar/xyz' },
  },
  version = 1,
  description = 'a description',
  type = 'text',
}: Partial<LibraryPanelDTO> = {}): LibraryPanelDTO {
  return {
    uid,
    id,
    orgId,
    folderId,
    name,
    model,
    version,
    meta,
    description,
    type,
  };
}
