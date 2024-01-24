import { SelectableValue } from '@grafarg/data';
import { GrafargAnnotationType } from './types';

export const annotationTypes: Array<SelectableValue<GrafargAnnotationType>> = [
  { text: 'Dashboard', value: GrafargAnnotationType.Dashboard },
  { text: 'Tags', value: GrafargAnnotationType.Tags },
];

export class GrafargAnnotationsQueryCtrl {
  annotation: any;

  types = annotationTypes;

  constructor() {
    this.annotation.type = this.annotation.type || GrafargAnnotationType.Tags;
    this.annotation.limit = this.annotation.limit || 100;
  }

  static templateUrl = 'partials/annotations.editor.html';
}
