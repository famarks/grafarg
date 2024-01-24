import React, { FC } from 'react';
import SideMenuDropDown from './SideMenuDropDown';
import { Icon } from '@grafarg/ui';
import { NavModelItem } from '@grafarg/data';

export interface Props {
  link: NavModelItem;
  onClick?: () => void;
}

const TopSectionItem: FC<Props> = ({ link, onClick }) => {
  return (
    <div className="sidemenu-item dropdown">
      <a className="sidemenu-link" href={link.url} target={link.target} onClick={onClick}>
        <span className="icon-circle sidemenu-icon">
          {link.icon && <Icon name={link.icon as any} size="xl" />}
          {link.img && <img src={link.img} />}
        </span>
      </a>
      <SideMenuDropDown link={link} onHeaderClick={onClick} />
    </div>
  );
};

export default TopSectionItem;
