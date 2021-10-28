/* eslint-disable */
import React from "react";
import isObject from "lodash/isObject";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

function getValue(value) {
  if (isObject(value)) return JSON.stringify(value);
  if (value && value.toString) return value.toString();
  if (value === null) return "";
  if (value === undefined) return "";
  return value;
}

const TooltipContent = () => {
  return (
    <>
      <div class="flex">
        <div class="relative mx-2">
          <div class="bg-black text-white text-xs rounded-sm py-1 px-4 right-0 bottom-full">
            Enter a valid email
            <svg
              class="absolute text-black h-2 w-full left-0 top-full"
              x="0px"
              y="0px"
              viewBox="0 0 255 255"
              xmlSpace="preserve"
            >
              <polygon class="fill-current" points="0,0 127.5,127.5 255,0" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

function TextCell({ isEditing, onChange, value }, ref) {
  const cellInnerEl = isEditing ? (
    <TooltipPrimitive.Root delayDuration={0} open={true}>
      <TooltipPrimitive.Trigger className="w-full h-full">
        <input
          value={getValue(value)}
          className="w-full h-full focus:outline-none"
          onChange={(newVal) => {
            if (isObject(value)) onChange(JSON.parse(newVal));
            else onChange(newVal);
          }}
          ref={ref}
        />
        <TooltipPrimitive.Content side="top">
          <TooltipContent />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Trigger>
    </TooltipPrimitive.Root>
  ) : (
    getValue(value)
  );
  return cellInnerEl;
}

export default React.forwardRef(TextCell);
