import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const SCROLL_OFFSET_TOP = 120;

export interface SubNavItem {
  name: string;
  id: string;
}

interface SubNavContext {
  underlineOffset?: number;
  underlineHeight?: number;
  underlineWidth?: number;
  updateUnderline: ({
    height,
    width,
    offset,
  }: {
    height?: number;
    width?: number;
    offset?: number;
  }) => void;
}

const subNavContext = createContext<SubNavContext | null>(null);

function SubNavProvider({ children }: { children: ReactNode }) {
  const [underlineOffset, setUnderlineOffset] = useState<number | undefined>();
  const [underlineHeight, setUnderlineHeight] = useState<number | undefined>();
  const [underlineWidth, setUnderlineWidth] = useState<number | undefined>();

  return (
    <subNavContext.Provider
      value={{
        underlineOffset,
        underlineHeight,
        underlineWidth,
        updateUnderline: ({ height, width, offset }) => {
          setUnderlineOffset(offset);
          setUnderlineHeight(height);
          setUnderlineWidth(width);
        },
      }}
    >
      <aside className="sticky top-0 pt-4 flex flex-col text-sm max-w-32">
        {children}
      </aside>
    </subNavContext.Provider>
  );
}

function useSubNav() {
  const context = useContext(subNavContext);

  if (!context) {
    throw new Error("useSubNav must be used within an AuthProvider");
  }

  return context;
}

export function SubNav({
  pageTitle,
  items,
}: {
  pageTitle: string;
  items: SubNavItem[];
}) {
  // TODO: Update page header to remove underline when scrolled to
  // This probably means extracting the "scrollObserver" functionality and
  // Reusing it here
  return (
    <SubNavProvider>
      <SubNavHeader title={pageTitle} />
      {items.map((item) => (
        <SubNavItem key={item.id} item={item} />
      ))}
      <Underline />
    </SubNavProvider>
  );
}

function SubNavHeader({ title }: { title: string }) {
  const subnav = useSubNav();

  useIntersection({
    elementId: "page-header",
    callback: (entries) => {
      if (Math.round(entries[0]?.boundingClientRect.top) <= SCROLL_OFFSET_TOP) {
        subnav.updateUnderline({
          height: undefined,
          width: undefined,
          offset: undefined,
        });
      }
    },
  });

  return (
    <div className="flex flex-col pl-3 pb-2 gap-1">
      <div className="text-xs text-slate-500">On this page</div>
      <div className="text-lg font-medium">{title}</div>
    </div>
  );
}

function Underline() {
  const subnav = useSubNav();

  return (
    <div
      id="underline"
      className={`absolute border border-black h-7 transition-all duration-200 pointer-events-none ${subnav.underlineWidth && subnav.underlineOffset && subnav.underlineHeight ? "opacity-100" : "opacity-0"}`}
      style={{
        borderRadius: "14px",
        top: `${subnav.underlineOffset}px`,
        height: `${subnav.underlineHeight}px`,
        width: `${subnav.underlineWidth}px`,
      }}
    />
  );
}

function SubNavItem({ item }: { item: SubNavItem }) {
  const subnav = useSubNav();
  const ref = useRef<HTMLDivElement>(null);

  useIntersection({
    elementId: item.id,
    callback: (entries) => {
      if (Math.round(entries[0]?.boundingClientRect.top) <= SCROLL_OFFSET_TOP) {
        console.log("height", ref.current?.offsetHeight);
        subnav.updateUnderline({
          height: ref.current?.offsetHeight,
          width: ref.current?.offsetWidth,
          offset: ref.current?.offsetTop,
        });
      }
    },
  });

  return (
    <div
      ref={ref}
      className="text-slate-500 hover:text-black hover:bg-slate-200/80 cursor-pointer py-1 px-3 rounded-full"
      onClick={() => {
        const root = document.getElementById("root");
        const section = document.getElementById(item.id);
        if (section) {
          root?.scrollTo({
            top: section.offsetTop - SCROLL_OFFSET_TOP,
            behavior: "smooth",
          });
        }
      }}
    >
      {item.name}
    </div>
  );
}

function useIntersection({
  elementId,
  callback,
  options = {
    threshold: [0, 1],
    rootMargin: `-${SCROLL_OFFSET_TOP}px 0px 0px 0px`,
  },
}: {
  elementId: string;
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
}) {
  useEffect(() => {
    const observer = new IntersectionObserver(callback, options);

    const section = document.getElementById(elementId);
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);
}
