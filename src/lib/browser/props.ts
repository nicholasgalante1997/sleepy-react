import React from "react";

export function getSleepyProps<
  P extends React.JSX.IntrinsicAttributes = object,
>(): P | {} {
  try {
    const propsDataItems = (window as any).__sleepy_props__;
    if (propsDataItems && propsDataItems.data) {
      return propsDataItems.data as P;
    } else {
      return {};
    }
  } catch (e) {
    console.error("sleepy:::(getSleepyProps()) has thrown an error");
    return {};
  }
}
