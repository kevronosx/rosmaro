import deep from 'deep-diff';
import {reduce, concat, head, values} from 'ramda';
const diff = deep.diff
const applyChange = deep.applyChange

export const mergeContexts = (original, newOnes) => {
  if (newOnes.length == 1) return newOnes[0];
  
  let diffs = newOnes
    .map(c => diff(original, c))
    .reduce((flat, arr) => [].concat(flat, arr), [])
  let result = {...original};

  diffs
    .filter(a => a)
    .forEach(d => applyChange(result, true, d))

  return result
};

export const mergeArrows = arrows => reduce(concat, [], arrows);

export const transparentSingleChildHandler = ({action, context, node, children}) => {
  const childRes = head(values(children))({action});
  return {
    ...childRes,
    arrows: addNodeToArrows(node.id, childRes.arrows),
  };
};

// arrows like [ [['a:a:a', 'x']] [['a:a:b', 'x']] ]
// node like 'a:a'
// result like [ [['a:a:a', 'x'], ['a:a', 'x']] [['a:a:b', 'x'], ['a:a', 'x']] ]
export const addNodeToArrows = (node, arrows) => {
  return arrows.map(arrow => node === 'main'
    ? arrow
    : [
      ...arrow,
      [node, arrow[arrow.length - 1][1]]
    ]
  );
}

/*
map like {x: 'y'}
arrows like [
  [['main:a:a:a', 'x'], ['main:a:a', 'x'], ['main:a', 'x']],
  ...
]
result like [
  [['main:a:a:a', 'x'], ['main:a:a', 'x'], ['main:a', 'y']],
    ...
]
*/
export const renameArrows = (map, arrows) => arrows.map(arrow => {
  const previousOnes = arrow.slice(0, -1);
  const lastOne = arrow[arrow.length - 1];
  const newLastOne = map[lastOne[1]]
    ? [lastOne[0], map[lastOne[1]]]
    : lastOne;
  return [...previousOnes, newLastOne];
});
