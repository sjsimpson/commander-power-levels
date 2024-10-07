import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const SCROLL_OFFSET_TOP = 120;

interface SubNavItem {
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
      <aside className="sticky top-0 text-sm max-w-32 hidden xl:flex xl:flex-col">
        {children}
      </aside>
    </subNavContext.Provider>
  );
}

function useSubNav() {
  const context = useContext(subNavContext);

  if (!context) {
    throw new Error("useSubNav must be used within an SubNavProvider");
  }

  return context;
}

// NOTE: Assumes a specific structure containing "sections"
// Probably a dangerous way to do this, but also prevents needing to pass
// variables around
export function SubNav({ pageTitle }: { pageTitle: string }) {
  const sections = document.querySelectorAll("section");

  return (
    <SubNavProvider>
      <SubNavHeader title={pageTitle} />
      {[...sections].map((item) => (
        <SubNavItem
          key={item.id}
          item={{ id: item.id, name: item.id.replaceAll("-", " ") }}
        />
      ))}
      <Underline />
    </SubNavProvider>
  );
}

function SubNavHeader({ title }: { title: string }) {
  const headerId = "page-header";
  const subnav = useSubNav();

  useIntersection({
    elementId: headerId,
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
      <div
        className="text-lg font-medium cursor-pointer"
        onClick={() => {
          const root = document.getElementById("root");
          const section = document.getElementById(headerId);
          if (section) {
            root?.scrollTo({
              top: section.offsetTop - SCROLL_OFFSET_TOP,
              behavior: "smooth",
            });
          }
        }}
      >
        {title}
      </div>
    </div>
  );
}

// FIX: on first paint, the box grows for multi-line items... not sure why
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
      className="text-slate-500 hover:text-black hover:bg-slate-200/80 cursor-pointer py-1 px-3 rounded-[14px]"
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
      {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
    </div>
  );
}

function useIntersection({
  elementId,
  callback,
  options = {
    threshold: [0, 1],
    // NOTE: Set bottom margin rediculously high so all content can fit
    rootMargin: `-${SCROLL_OFFSET_TOP}px 0px -10000px 0px`,
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
