import {
  createElement,
  forwardRef,
  HtmlHTMLAttributes,
  PropsWithChildren,
  Ref,
} from "react";
import classNames from "classnames";

type TextElements = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
type FontWeights = "regular" | "medium" | "bold";

export interface BaseTextProps extends HtmlHTMLAttributes<HTMLElement> {
  weight?: FontWeights;
  tag?: TextElements;
  ref?: Ref<HTMLElement>;
}

const renderBaseText = ({
  tag: Component = "span",
  weight = "regular",
  ref,
  className,
  children,
  ...props
}: PropsWithChildren<BaseTextProps>) => {
  return createElement(
    Component,
    {
      className: classNames(
        {
          regular: "font-normal",
          medium: "font-medium",
          bold: "font-bold",
        }[weight],
        className
      ),
      ref,
      ...props,
    },
    children
  );
};

export const Display2XL = forwardRef<
  HTMLElement,
  PropsWithChildren<BaseTextProps>
>(function Display2XL({ className, tag = "h1", ...props }, ref) {
  return renderBaseText({
    className: classNames("text-5xl font-bold tracking-tight", className),
    tag,
    ref,
    ...props,
  });
});

export const DisplayXL = forwardRef<
  HTMLElement,
  PropsWithChildren<BaseTextProps>
>(function DisplayXL({ className, tag = "h2", ...props }, ref) {
  return renderBaseText({
    className: classNames("text-4xl font-bold tracking-tight", className),
    tag,
    ref,
    ...props,
  });
});

export const DisplayLG = forwardRef<
  HTMLElement,
  PropsWithChildren<BaseTextProps>
>(function DisplayLG({ className, tag = "h3", ...props }, ref) {
  return renderBaseText({
    className: classNames("text-3xl font-bold tracking-tight", className),
    tag,
    ref,
    ...props,
  });
});

export const DisplayMD = forwardRef<
  HTMLElement,
  PropsWithChildren<BaseTextProps>
>(function DisplayMD({ className, tag = "h4", ...props }, ref) {
  return renderBaseText({
    className: classNames("text-2xl font-bold tracking-tight", className),
    tag,
    ref,
    ...props,
  });
});

export const DisplaySM = forwardRef<
  HTMLElement,
  PropsWithChildren<BaseTextProps>
>(function DisplaySM({ className, tag = "h5", ...props }, ref) {
  return renderBaseText({
    className: classNames("text-xl font-bold tracking-tight", className),
    tag,
    ref,
    ...props,
  });
});

export const DisplayXS = forwardRef<
  HTMLElement,
  PropsWithChildren<BaseTextProps>
>(function DisplayXS({ className, tag = "h6", ...props }, ref) {
  return renderBaseText({
    className: classNames("text-lg font-bold tracking-tight", className),
    tag,
    ref,
    ...props,
  });
});

export const TextXL = forwardRef<HTMLElement, PropsWithChildren<BaseTextProps>>(
  function TextXL({ className, ...props }, ref) {
    return renderBaseText({
      className: classNames("text-xl leading-8", className),
      ref,
      ...props,
    });
  }
);

export const TextLG = forwardRef<HTMLElement, PropsWithChildren<BaseTextProps>>(
  function TextLG({ className, ...props }, ref) {
    return renderBaseText({
      className: classNames("text-lg leading-7", className),
      ref,
      ...props,
    });
  }
);

export const TextMD = forwardRef<HTMLElement, PropsWithChildren<BaseTextProps>>(
  function TextMD({ className, ...props }, ref) {
    return renderBaseText({
      className: classNames("text-base leading-6", className),
      ref,
      ...props,
    });
  }
);

export const TextSM = forwardRef<HTMLElement, PropsWithChildren<BaseTextProps>>(
  function TextSM({ className, ...props }, ref) {
    return renderBaseText({
      className: classNames("text-sm leading-5", className),
      ref,
      ...props,
    });
  }
);

export const TextXS = forwardRef<HTMLElement, PropsWithChildren<BaseTextProps>>(
  function TextXS({ className, ...props }, ref) {
    return renderBaseText({
      className: classNames("text-xs leading-4", className),
      ref,
      ...props,
    });
  }
);

export const Typography = {
  Display2XL,
  DisplayXL,
  DisplayLG,
  DisplayMD,
  DisplaySM,
  DisplayXS,
  TextXL,
  TextLG,
  TextMD,
  TextSM,
  TextXS,
};
