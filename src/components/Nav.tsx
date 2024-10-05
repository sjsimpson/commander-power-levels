import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import {
  ArrowLongRightIcon,
  ArrowTurnDownRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/20/solid";
import { cva, type VariantProps } from "class-variance-authority";
import { useState, type ReactNode } from "react";

interface NavItem {
  name: string;
  href: string;
}

export interface TopLevelNavItem extends NavItem {
  name: string;
  href: string;
  children?: NavItem[];
}

export function Nav({
  pathname,
  links,
}: {
  pathname: string;
  links: TopLevelNavItem[];
}) {
  return (
    <ul className="flex flex-col gap-1 w-full h-screen border-r border-r-slate-200 px-4">
      {links.map((link) => (
        <NavLink
          key={link.href}
          name={link.name}
          href={link.href}
          pathname={pathname}
          children={link.children}
        />
      ))}
    </ul>
  );
}

function NavLink({
  pathname,
  name,
  href,
  children,
}: { pathname: string } & TopLevelNavItem) {
  const inRootPath = pathname === "/";
  const isRoot = href === "/";
  const active = (isRoot && inRootPath) || (!isRoot && pathname.includes(href));

  const [open, setOpen] = useState(false);

  return (
    <li className="group/parent">
      <div className="flex flex-row">
        <Link layer="parent" name={name} href={href} pathname={pathname} />
        {children && !active && (
          <div
            className={clsx(
              "flex size-8 items-center justify-center cursor-pointer text-slate-500 transition-transform duration-100",
              open && "-rotate-180",
            )}
            onClick={() => setOpen(!open)}
          >
            <ChevronDownIcon className="size-4" />
          </div>
        )}
      </div>
      {children && (
        <ChildrenWrapper collapsed={!(active || open)}>
          {children.map((child) => (
            <li key={child.href} className="group/child">
              <Link
                layer="child"
                name={child.name}
                href={href + child.href}
                pathname={pathname}
              />
            </li>
          ))}
        </ChildrenWrapper>
      )}
    </li>
  );
}

const ChildrenWrapperStyles = cva(["pl-16"], {
  variants: {
    collapsed: {
      true: "hidden",
      false: "flex",
    },
  },
});

function ChildrenWrapper({
  collapsed,
  children,
}: { children: ReactNode } & VariantProps<typeof ChildrenWrapperStyles>) {
  return (
    <div className={ChildrenWrapperStyles({ collapsed })}>
      <ul>{children}</ul>
    </div>
  );
}

const LinkVariants = cva(["relative flex flex-row-reverse"], {
  variants: {
    layer: {
      parent: "group-hover/parent:flex-row",
      child: "group-hover/child:flex-row",
    },
  },
});

function Link({
  href,
  name,
  layer,
  pathname,
}: NavItem & { pathname: string } & VariantProps<typeof LinkVariants>) {
  const inRootPath = pathname === "/";
  const isRoot = href === "/";
  const active = (isRoot && inRootPath) || (!isRoot && pathname.includes(href));

  return (
    <a
      href={href}
      className={twMerge(clsx("flex py-1 pl-4 gap-2 items-center relative"))}
    >
      <ArrowIndicator layer={layer} active={active} />
      <div className={LinkVariants({ layer })}>
        {name}
        <UnderlineIndicator layer={layer} active={active} />
      </div>
    </a>
  );
}

const ArrowIndicatorVariants = cva(
  [
    "absolute size-6 pointer-events-none flex items-center",
    "top-1 -left-4 duration-100",
  ],
  {
    variants: {
      layer: {
        parent: "group-hover/parent:visible group-hover/parent:translate-x-1",
        child: "group-hover/child:visible group-hover/child:translate-x-1",
      },
      active: {
        true: "visible translate-x-1 transition-none",
        false: "invisible transition-all",
      },
    },
  },
);

function ArrowIndicator({
  layer,
  active,
}: VariantProps<typeof ArrowIndicatorVariants>) {
  return (
    <div className={ArrowIndicatorVariants({ layer, active })}>
      {layer === "parent" ? (
        <ArrowLongRightIcon className="size-5 stroke-2" />
      ) : (
        <ArrowTurnDownRightIcon className="size-5 stroke-2" />
      )}
    </div>
  );
}

const UnderlineIndicatorVariants = cva(
  ["absolute top-6 h-[2px] rounded-full bg-slate-700 duration-200"],
  {
    variants: {
      layer: {
        parent: "group-hover/parent:visible group-hover/parent:w-full",
        child: "group-hover/child:visible group-hover/child:w-full",
      },
      active: {
        true: "visible w-full transition-none",
        false: "invisible transition-all w-0",
      },
    },
  },
);

function UnderlineIndicator({
  layer,
  active,
}: VariantProps<typeof UnderlineIndicatorVariants>) {
  return <div className={UnderlineIndicatorVariants({ layer, active })} />;
}
