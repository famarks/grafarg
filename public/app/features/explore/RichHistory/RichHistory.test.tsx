import React from 'react';
import { mount } from 'enzyme';
import { GrafargTheme } from '@grafarg/data';
import { ExploreId } from '../../../types/explore';
import { RichHistory, RichHistoryProps, Tabs } from './RichHistory';
import { Tab } from '@grafarg/ui';

jest.mock('../state/selectors', () => ({ getExploreDatasources: jest.fn() }));

const setup = (propOverrides?: Partial<RichHistoryProps>) => {
  const props: RichHistoryProps = {
    theme: {} as GrafargTheme,
    exploreId: ExploreId.left,
    height: 100,
    activeDatasourceInstance: 'Test datasource',
    richHistory: [],
    firstTab: Tabs.RichHistory,
    deleteRichHistory: jest.fn(),
    onClose: jest.fn(),
  };

  Object.assign(props, propOverrides);

  const wrapper = mount(<RichHistory {...props} />);
  return wrapper;
};

describe('RichHistory', () => {
  it('should render all tabs in tab bar', () => {
    const wrapper = setup();
    expect(wrapper.find(Tab)).toHaveLength(3);
  });

  it('should render correct lebels of tabs in tab bar', () => {
    const wrapper = setup();
    expect(wrapper.find(Tab).at(0).text()).toEqual('Query history');
    expect(wrapper.find(Tab).at(1).text()).toEqual('Starred');
    expect(wrapper.find(Tab).at(2).text()).toEqual('Settings');
  });

  it('should correctly render query history tab as active tab', () => {
    const wrapper = setup();
    expect(wrapper.find('RichHistoryQueriesTab')).toHaveLength(1);
  });

  it('should correctly render starred tab as active tab', () => {
    const wrapper = setup({ firstTab: Tabs.Starred });
    expect(wrapper.find('RichHistoryStarredTab')).toHaveLength(1);
  });
});
