import { createAction } from '@reduxjs/toolkit';
import { LoadingState } from '@grafarg/data';

import { LibraryPanelDTO } from '../../types';
import { AnyAction } from 'redux';

export interface LibraryPanelsViewState {
  loadingState: LoadingState;
  libraryPanels: LibraryPanelDTO[];
  searchString: string;
  totalCount: number;
  perPage: number;
  page: number;
  numberOfPages: number;
  currentPanelId?: string;
}

export const initialLibraryPanelsViewState: LibraryPanelsViewState = {
  loadingState: LoadingState.NotStarted,
  libraryPanels: [],
  searchString: '',
  totalCount: 0,
  perPage: 10,
  page: 1,
  numberOfPages: 0,
  currentPanelId: undefined,
};

export const initSearch = createAction('libraryPanels/view/initSearch');
export const searchCompleted = createAction<
  Omit<LibraryPanelsViewState, 'currentPanelId' | 'searchString' | 'loadingState' | 'numberOfPages'>
>('libraryPanels/view/searchCompleted');
export const changeSearchString = createAction<Pick<LibraryPanelsViewState, 'searchString'>>(
  'libraryPanels/view/changeSearchString'
);
export const changePage = createAction<Pick<LibraryPanelsViewState, 'page'>>('libraryPanels/view/changePage');

export const libraryPanelsViewReducer = (state: LibraryPanelsViewState, action: AnyAction) => {
  if (initSearch.match(action)) {
    return { ...state, loadingState: LoadingState.Loading };
  }

  if (searchCompleted.match(action)) {
    const { libraryPanels, page, perPage, totalCount } = action.payload;
    const numberOfPages = Math.ceil(totalCount / perPage);
    return {
      ...state,
      libraryPanels,
      perPage,
      totalCount,
      loadingState: LoadingState.Done,
      numberOfPages,
      page: page > numberOfPages ? page - 1 : page,
    };
  }

  if (changeSearchString.match(action)) {
    return { ...state, searchString: action.payload.searchString };
  }

  if (changePage.match(action)) {
    return { ...state, page: action.payload.page };
  }

  return state;
};
