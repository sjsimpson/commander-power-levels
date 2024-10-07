import { useEffect, useState, type ReactNode } from "react";
import { clsx } from "clsx";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowLeftIcon, Bars3Icon } from "@heroicons/react/20/solid";
import { twMerge } from "tailwind-merge";
import {
  ArrowLongRightIcon,
  ArrowTurnDownRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/20/solid";

export function PrimaryNav({
  pathname,
  navItems,
}: {
  pathname: string;
  navItems: TopLevelNavItem[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed flex flex-row lg:hidden h-20 w-full items-center z-10 bg-slate-100 pl-4 2xs:pl-12 gap-4">
        <div
          className=" rounded-full size-5 cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <Bars3Icon />
        </div>
      </div>
      <NavDrawer
        pathname={pathname}
        navItems={navItems}
        open={open}
        setOpen={setOpen}
      />
    </>
  );
}

const NavDrawerStyles = cva(
  [
    "fixed top-0 left-0 flex flex-col h-screen w-72 pl-20 pt-24 pb-12 gap-4 z-30",
    "bg-slate-100 transition-all duration-100",
  ],
  {
    variants: {
      open: { true: "left-0", false: "-left-72" },
      largeScreen: {
        true: "transition-none",
        false: "border-r border-r-slate-200",
      },
    },
  },
);

interface NavItem {
  name: string;
  href: string;
}

export interface TopLevelNavItem extends NavItem {
  name: string;
  href: string;
  children?: NavItem[];
}

// FIX: Sizing at "large" shift is bad, need to really nail down sizing
export function NavDrawer({
  pathname,
  navItems,
  open,
  setOpen,
}: {
  pathname: string;
  navItems: TopLevelNavItem[];
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const lg = useMediaQuery(breakpoints.lg);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <div className={NavDrawerStyles({ open: open || lg, largeScreen: lg })}>
        <div
          className="absolute top-8 left-4 2xs:left-12 rounded-full size-5 lg:hidden cursor-pointer"
          onClick={() => setOpen(false)}
        >
          <ArrowLeftIcon />
        </div>
        <div className="uppercase tracking-wider font-semibold text-xl">
          <a href="/" className="cursor-pointer">
            Commander Power Levels
          </a>
        </div>
        <ul
          className={clsx(
            "flex flex-col gap-1 w-full h-screen",
            lg && "border-r border-r-slate-200",
          )}
        >
          {navItems.map((link) => (
            <NavLink
              key={link.href}
              name={link.name}
              href={link.href}
              pathname={pathname}
              children={link.children}
            />
          ))}
        </ul>
      </div>
      {open && !lg && (
        <div
          className="fixed w-screen h-screen bg-black/20 z-20 cursor-pointer"
          onClick={() => setOpen(false)}
        />
      )}
    </>
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

const ChildrenWrapperStyles = cva(["pl-8"], {
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
      className={twMerge(clsx("flex py-1 gap-2 items-center relative"))}
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
    "top-1 -left-8 duration-100",
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
  ["absolute top-6 h-[1px] rounded-full bg-slate-700 duration-200"],
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

export const breakpoints = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  xxl: "(min-width: 1536px)",
};

export function useMediaQuery(breakpoint: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(breakpoint);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, breakpoint]);

  return matches;
}
