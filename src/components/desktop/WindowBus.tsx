import React, { createContext, useContext } from "react";
import type { BlogPost } from "../pages/BlogSection"; // máš-li jinou cestu, uprav

export type WindowBus = {
  openPostWindow: (post: BlogPost) => void;
};

const noop: WindowBus = { openPostWindow: () => {} };

export const WindowBusCtx = createContext<WindowBus>(noop);
export const useWindowBus = () => useContext(WindowBusCtx);
