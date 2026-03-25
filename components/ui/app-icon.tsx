import { cn } from "@/lib/utils";

type IconName =
  | "chat"
  | "dashboard"
  | "document"
  | "source"
  | "review"
  | "monitor"
  | "settings"
  | "translate"
  | "upload"
  | "spark"
  | "shield"
  | "paperclip"
  | "check"
  | "arrow-left"
  | "plus"
  | "search"
  | "x";

const paths: Record<IconName, React.ReactNode> = {
  chat: (
    <path
      d="M7 10.5a4.5 4.5 0 0 1 4.5-4.5h17A4.5 4.5 0 0 1 33 10.5v10A4.5 4.5 0 0 1 28.5 25H17l-6 5v-5h-.5A4.5 4.5 0 0 1 6 20.5Z"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
    />
  ),
  dashboard: (
    <>
      <rect x="7" y="7" width="11" height="11" rx="3" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <rect x="22" y="7" width="11" height="7" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <rect x="22" y="18" width="11" height="11" rx="3" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <rect x="7" y="22" width="11" height="7" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
    </>
  ),
  document: (
    <>
      <path
        d="M11 5h12l7 7v18a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
      <path d="M23 5v7h7" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.2" />
      <path d="M13 20h12M13 25h8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
    </>
  ),
  source: (
    <>
      <path
        d="M20 6c-7.18 0-13 5.82-13 13s5.82 13 13 13 13-5.82 13-13S27.18 6 20 6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path d="M7.5 19h25M20 6a19 19 0 0 1 0 26M20 6a19 19 0 0 0 0 26" fill="none" stroke="currentColor" strokeWidth="2.2" />
    </>
  ),
  review: (
    <>
      <path
        d="M20 5l4.7 9.5L35 16l-7.5 7.3 1.8 10.2L20 28.7l-9.3 4.8L12.5 23 5 16l10.3-1.5Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </>
  ),
  monitor: (
    <>
      <path d="M8 28h24" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
      <path d="M12 24V14m8 10V9m8 15V18" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      <circle cx="20" cy="7" r="2.5" fill="currentColor" />
      <circle cx="28" cy="16" r="2.5" fill="currentColor" />
    </>
  ),
  settings: (
    <>
      <path
        d="M20 9.5a10.5 10.5 0 1 0 0 21 10.5 10.5 0 0 0 0-21Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path
        d="M20 3v5m0 24v5m17-17h-5M8 20H3m29.3-10.3-3.6 3.6M11.3 28.7l-3.6 3.6m0-22.6 3.6 3.6m17.4 17.4 3.6 3.6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
      <circle cx="20" cy="20" r="4.2" fill="none" stroke="currentColor" strokeWidth="2.2" />
    </>
  ),
  translate: (
    <>
      <path d="M8 11h13M14.5 7v4c0 6-2.2 10.9-6.5 14" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
      <path d="M10 20c1.8 2.4 3.9 4.2 6.5 5.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
      <path d="M24 10l6 16m-10.5 0L24 10m-2.7 9.2h5.4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
    </>
  ),
  upload: (
    <>
      <path d="M20 28V10" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
      <path d="m12 17 8-8 8 8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
      <path d="M9 31h22" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
    </>
  ),
  spark: (
    <>
      <path d="m20 5 2.9 8.1L31 16l-8.1 2.9L20 27l-2.9-8.1L9 16l8.1-2.9Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.2" />
      <path d="m8 6 1 3 3 1-3 1-1 3-1-3-3-1 3-1Zm24 16 1.2 3.4 3.3 1.1-3.3 1.2L32 31l-1.2-3.3-3.3-1.2 3.3-1.1Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.2" />
    </>
  ),
  shield: (
    <path
      d="M20 5c3.3 2.7 7.5 4.4 12 5v7.4c0 7.2-4.8 13.8-12 16.6-7.2-2.8-12-9.4-12-16.6V10c4.5-.6 8.7-2.3 12-5Z"
      fill="none"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="2.2"
    />
  ),
  paperclip: (
    <path
      d="M26 13.5 15.3 24.2a5 5 0 1 1-7.1-7L21.1 4.3a7 7 0 1 1 9.9 9.9L15.8 29.4a9 9 0 0 1-12.7-12.8L15 4.8"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
    />
  ),
  check: (
    <path d="m10 20 6 6 14-14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.6" />
  ),
  "arrow-left": (
    <path
      d="M28 20H12m0 0 7-7m-7 7 7 7"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
    />
  ),
  plus: (
    <path
      d="M20 8v24M8 20h24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2.4"
    />
  ),
  search: (
    <>
      <circle cx="18" cy="18" r="10" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="m26 26 6 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />
    </>
  ),
  x: (
    <path
      d="M12 12l16 16M28 12 12 28"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2.4"
    />
  ),
};

export function AppIcon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={cn("h-5 w-5 shrink-0", className)}
    >
      {paths[name]}
    </svg>
  );
}
