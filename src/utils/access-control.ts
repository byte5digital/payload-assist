import { AccessArgs, AccessResult, PayloadRequest } from "payload";
import { payloadAssistConfig } from "./payload-assist";

export type Access = <TData = any>(args: AccessArgs<TData>) => AccessResult;
type Operator = "and" | "or";
type ChainElement<T> =
  | {
      operator: Operator;
      conditions: (T | ChainElement<T>)[];
    }
  | {
      operator: "init";
      conditions: T;
    };

type ChainControllers = {
  isLoggedIn: () => AccessChain;
  isAdmin: () => AccessChain;
  isUserRole: (role: string | number) => AccessChain;
  isCustomCondition: (condition: Access) => AccessChain;
} & {
  [accessControllerName: string]: (...args: any[]) => AccessChain;
};

type AccessChain = Access & {
  and: ChainControllers;
  or: ChainControllers;
};

/**
 * Resolves a Chain to an AccessResult
 * @param element - The ChainElement to resolve
 * @param req - The PayloadRequest
 * @returns The AccessResult
 */
export const resolveChain = (
  element: ChainElement<Access>,
  args: AccessArgs
): AccessResult => {
  switch (element.operator) {
    case "and":
      return element.conditions.every((condition) => {
        if (typeof condition === "function") {
          return condition(args);
        } else {
          // condition is a ChainElement object
          return resolveChain(condition, args);
        }
      });

    case "or":
      return element.conditions.some((condition) => {
        if (typeof condition === "function") {
          return condition(args);
        } else {
          // condition is a ChainElement object
          return resolveChain(condition, args);
        }
      });

    case "init":
      return element.conditions(args);

    default:
      throw new Error("Invalid operator");
  }
};

/**
 * Turns the chain into an access callback function that is called by payload. The given chain is resolved in the callback.
 * @param chain
 * @returns Access callback function that is called by payload
 */
const accessCallbackBuilder = (chain: ChainElement<Access>) => {
  return (args: AccessArgs) => resolveChain(chain, args);
};

/**
 * Adds a new condition to the chain
 * @param newCondition The new condition to add to the chain
 * @param operator The operator to use for the new condition
 * @param chain The previous chain
 * @returns ChainElement<Access> The new Chain
 */
const addChainElement = (
  newCondition: Access,
  operator: Operator,
  chain: ChainElement<Access>
): ChainElement<Access> => {
  if (chain.operator === "init") {
    // previous chain was initialized and therefore did not have an operator
    return {
      operator: operator,
      conditions: [chain.conditions, newCondition],
    };
  }

  if (operator === chain.operator) {
    // same operator as before -> new condition can just be added to the previous chain
    chain.conditions.push(newCondition);
    return chain;
  }

  if (operator === "and") {
    // and operator has a higher precedence than or -> new condition needs to be added to a new condition element
    const lastCondition = chain.conditions.pop();
    const conditions = lastCondition
      ? [lastCondition, newCondition]
      : [newCondition];

    chain.conditions.push({
      operator: "and",
      conditions: conditions,
    });
    return chain;
  }

  if (operator === "or") {
    // or operator has a lower precedence than and -> previous conditions need to be wrapped in a condition element and new condition will be added around it.
    return {
      operator: "or",
      conditions: [chain, newCondition],
    };
  }

  throw new Error("Invalid operator");
};

/**
 * Builds a chain from a new condition and an optional previous chain element
 * @param newCondition - The new condition to add to the chain
 * @param chain - The previous chain element to add the new condition to (optional)
 * @returns The new chain
 */
const buildChain = (
  newCondition: Access,
  chain?: {
    operator: Operator;
    chainElements: ChainElement<Access>;
  }
): AccessChain => {
  const newChain = chain
    ? addChainElement(newCondition, chain.operator, chain.chainElements)
    : ({
        operator: "init",
        conditions: newCondition,
      } satisfies ChainElement<Access>);

  const accessChainBase = accessCallbackBuilder(newChain) as AccessChain;
  accessChainBase.and = buildChainControllers({
    operator: "and",
    chainElements: newChain,
  });
  accessChainBase.or = buildChainControllers({
    operator: "or",
    chainElements: newChain,
  });

  return accessChainBase;
};

/**
 * Builds the chain controllers
 * @param chain - The previous chain element to add the new condition to (optional)
 * @returns The chain controllers
 */
const buildChainControllers = (chain?: {
  operator: Operator;
  chainElements: ChainElement<Access>;
}): ChainControllers => {
  const chainControllers: ChainControllers = {
    isLoggedIn: () => buildChain(isLoggedInCondition, chain),
    isAdmin: () => buildChain(isAdminCondition, chain),
    isUserRole: (role: string | number) =>
      buildChain(isUserRoleConditionBuilder(role), chain),
    isCustomCondition: (condition: Access) =>
      buildChain(isCustomConditionBuilder(condition), chain),
  };

  if (payloadAssistConfig?.customAccessControllers) {
    Object.entries(payloadAssistConfig.customAccessControllers).forEach(
      ([accessControllerName, accessController]) => {
        chainControllers[accessControllerName] = (...args: any[]) =>
          buildChain(
            (accessController as (...a: any[]) => Access)(...args),
            chain
          );
      }
    );
  }

  return chainControllers;
};

// Base access conditions
const isLoggedInCondition: Access = ({ req }) => {
  return !!req.user;
};

const isAdminCondition: Access = ({ req }) => {
  if (!payloadAssistConfig)
    throw "PayloadAssist is not initialized. Use payloadAssist() to initialize it.";
  return withUserRoleAdapter(req, payloadAssistConfig.adminUserRole);
};

// no extra params will be passed through the chain, so the condition will be build with a closure
const isUserRoleConditionBuilder =
  (role: string | number): Access =>
  ({ req }) => {
    return withUserRoleAdapter(req, role);
  };

const isCustomConditionBuilder = (condition: Access): Access => condition;

/**
 * Checks if the user has the given role - executes the userRole function from the config
 * @param req - The PayloadRequest
 * @param role - The role to check
 * @returns True if the user has the given role, false otherwise
 */
const withUserRoleAdapter = (req: PayloadRequest, role: string | number) => {
  if (!payloadAssistConfig)
    throw "PayloadAssist is not initialized. Use payloadAssist() to initialize it.";
  return payloadAssistConfig.getUserRole(req, role);
};

const accessControl = buildChainControllers();
export default accessControl;
export const { isLoggedIn, isAdmin, isUserRole, isCustomCondition } =
  accessControl;
export type { AccessChain, ChainControllers };
