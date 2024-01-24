import React, { FunctionComponent } from 'react';
import { LoadingPlaceholder } from '@grafarg/ui';

export const LoadingChunkPlaceHolder: FunctionComponent = React.memo(() => (
  <div className="preloader">
    <LoadingPlaceholder text={'Loading...'} />
  </div>
));

LoadingChunkPlaceHolder.displayName = 'LoadingChunkPlaceHolder';
