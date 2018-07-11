import buildGraph from './../graphBuilder/api';
import makeHandlers from './../handlers/api';
import fsm from './../fsm/api';
import {nonEmptyArrow} from './../utils';
import dispatch from './../dispatcher/api';
import extendModelData from './modelData';

const hasAnyArrowBeenFollowed = arrows => arrows.some(nonEmptyArrow);

const removeUnusedFSMState = ({newFSMState, graph}) => {
  const minimalFSMState = Object.keys(graph).reduce((FSMState, node) => {
    const existingState = newFSMState[node];
    if (!existingState) return FSMState;
    return {
      ...FSMState,
      [node]: newFSMState[node]
    };
  }, {});
  return minimalFSMState;
};

export default ({
  graph: graphPlan,
  handlers: handlersPlan
}) => {

  return ({state, action}) => {
    // {handlers, lenses, nodes}
    const basedOnHandlersPlan = makeHandlers(handlersPlan, graphPlan);

    // {graph, handlers, lenses}
    const modelParts = buildGraph({
      plan: graphPlan,
      //{lenses, nodes, handlers}
      ...basedOnHandlersPlan,
      ctx: state ? state.ctx : {}
    });

    // {FSMState, ctx, instanceID}
    const modelData = extendModelData({
      readModelData: state,
      graph: modelParts.graph
    });

    // {arrows, ctx, res}
    const dispatchRes = dispatch({
      graph: modelParts.graph,
      FSMState: modelData.FSMState,
      handlers: modelParts.handlers,
      instanceID: modelData.instanceID,
      ctx: modelData.ctx,
      action,
      lenses: modelParts.lenses,
    });

    // adds newFSMState
    const newFSMState = fsm({
      graph: modelParts.graph, 
      FSMState: modelData.FSMState, 
      arrows: dispatchRes.arrows
    });

    const anyArrowFollowed = hasAnyArrowBeenFollowed(dispatchRes.arrows);

    // adds newModelParts (so we know the new graph)
    const newModelParts = buildGraph({
      plan: graphPlan,
      //{lenses, nodes, handlers}
      ...basedOnHandlersPlan,
      ctx: dispatchRes.ctx
    });

    return {
      state: {
        FSMState: removeUnusedFSMState({
          newFSMState, 
          graph: newModelParts.graph
        }),
        instanceID: {},
        ctx: dispatchRes.ctx,
      },
      anyArrowFollowed,
      res: dispatchRes.res
    };

  };

};