import { FieldType, toDataFrame } from '@grafarg/data';
import { getAnnotationsFromData } from './standardAnnotationSupport';

describe('DataFrame to annotations', () => {
  test('simple conversion', async () => {
    const frame = toDataFrame({
      fields: [
        { type: FieldType.time, values: [1, 2, 3, 4, 5] },
        { name: 'first string field', values: ['t1', 't2', 't3', null, undefined] },
        { name: 'tags', values: ['aaa,bbb', 'bbb,ccc', 'zyz', null, undefined] },
      ],
    });

    await expect(getAnnotationsFromData([frame])).toEmitValues([
      [
        {
          color: 'red',
          tags: ['aaa', 'bbb'],
          text: 't1',
          time: 1,
          type: 'default',
        },
        {
          color: 'red',
          tags: ['bbb', 'ccc'],
          text: 't2',
          time: 2,
          type: 'default',
        },
        {
          color: 'red',
          tags: ['zyz'],
          text: 't3',
          time: 3,
          type: 'default',
        },
        {
          color: 'red',
          time: 4,
          type: 'default',
        },
        {
          color: 'red',
          time: 5,
          type: 'default',
        },
      ],
    ]);
  });

  test('explicit mappins', async () => {
    const frame = toDataFrame({
      fields: [
        { name: 'time1', values: [111, 222, 333] },
        { name: 'time2', values: [100, 200, 300] },
        { name: 'aaaaa', values: ['a1', 'a2', 'a3'] },
        { name: 'bbbbb', values: ['b1', 'b2', 'b3'] },
      ],
    });

    const observable = getAnnotationsFromData([frame], {
      text: { value: 'bbbbb' },
      time: { value: 'time2' },
      timeEnd: { value: 'time1' },
      title: { value: 'aaaaa' },
    });

    await expect(observable).toEmitValues([
      [
        {
          color: 'red',
          text: 'b1',
          time: 100,
          timeEnd: 111,
          title: 'a1',
          type: 'default',
        },
        {
          color: 'red',
          text: 'b2',
          time: 200,
          timeEnd: 222,
          title: 'a2',
          type: 'default',
        },
        {
          color: 'red',
          text: 'b3',
          time: 300,
          timeEnd: 333,
          title: 'a3',
          type: 'default',
        },
      ],
    ]);
  });
});
