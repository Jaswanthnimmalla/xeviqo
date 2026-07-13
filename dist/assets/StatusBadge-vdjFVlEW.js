import{j as e,ab as d,l as r}from"./index-DRYAZNqi.js";import{C as t}from"./circle-x-CXxSyBTA.js";import{C as s}from"./clock-3-Bdb0Jcv6.js";const x={active:{bg:"bg-emerald-100 dark:bg-emerald-500/15",text:"text-emerald-700 dark:text-emerald-400",border:"border-emerald-200 dark:border-emerald-500/30",icon:e.jsx(r,{className:"h-3.5 w-3.5"})},inactive:{bg:"bg-slate-100 dark:bg-slate-700/40",text:"text-slate-700 dark:text-slate-300",border:"border-slate-200 dark:border-slate-600",icon:e.jsx(t,{className:"h-3.5 w-3.5"})},paid:{bg:"bg-emerald-100 dark:bg-emerald-500/15",text:"text-emerald-700 dark:text-emerald-400",border:"border-emerald-200 dark:border-emerald-500/30",icon:e.jsx(r,{className:"h-3.5 w-3.5"})},pending:{bg:"bg-amber-100 dark:bg-amber-500/15",text:"text-amber-700 dark:text-amber-400",border:"border-amber-200 dark:border-amber-500/30",icon:e.jsx(s,{className:"h-3.5 w-3.5"})},processing:{bg:"bg-blue-100 dark:bg-blue-500/15",text:"text-blue-700 dark:text-blue-400",border:"border-blue-200 dark:border-blue-500/30",icon:e.jsx(s,{className:"h-3.5 w-3.5"})},completed:{bg:"bg-emerald-100 dark:bg-emerald-500/15",text:"text-emerald-700 dark:text-emerald-400",border:"border-emerald-200 dark:border-emerald-500/30",icon:e.jsx(r,{className:"h-3.5 w-3.5"})},approved:{bg:"bg-green-100 dark:bg-green-500/15",text:"text-green-700 dark:text-green-400",border:"border-green-200 dark:border-green-500/30",icon:e.jsx(r,{className:"h-3.5 w-3.5"})},issued:{bg:"bg-violet-100 dark:bg-violet-500/15",text:"text-violet-700 dark:text-violet-400",border:"border-violet-200 dark:border-violet-500/30",icon:e.jsx(r,{className:"h-3.5 w-3.5"})},refunded:{bg:"bg-cyan-100 dark:bg-cyan-500/15",text:"text-cyan-700 dark:text-cyan-400",border:"border-cyan-200 dark:border-cyan-500/30",icon:e.jsx(d,{className:"h-3.5 w-3.5"})},failed:{bg:"bg-red-100 dark:bg-red-500/15",text:"text-red-700 dark:text-red-400",border:"border-red-200 dark:border-red-500/30",icon:e.jsx(t,{className:"h-3.5 w-3.5"})},cancelled:{bg:"bg-red-100 dark:bg-red-500/15",text:"text-red-700 dark:text-red-400",border:"border-red-200 dark:border-red-500/30",icon:e.jsx(t,{className:"h-3.5 w-3.5"})},unread:{bg:"bg-blue-100 dark:bg-blue-500/15",text:"text-blue-700 dark:text-blue-400",border:"border-blue-200 dark:border-blue-500/30",icon:e.jsx(d,{className:"h-3.5 w-3.5"})},read:{bg:"bg-slate-100 dark:bg-slate-700/40",text:"text-slate-700 dark:text-slate-300",border:"border-slate-200 dark:border-slate-600",icon:e.jsx(r,{className:"h-3.5 w-3.5"})}};function m({label:b="",className:o=""}){const l=b.toLowerCase(),a=x[l]??{bg:"bg-slate-100 dark:bg-slate-700",text:"text-slate-700 dark:text-slate-300",border:"border-slate-200 dark:border-slate-600",icon:e.jsx(d,{className:"h-3.5 w-3.5"})};return e.jsxs("span",{className:`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        px-3
        py-1
        text-xs
        font-semibold
        capitalize
        whitespace-nowrap
        transition-all
        duration-200
        ${a.bg}
        ${a.text}
        ${a.border}
        ${o}
      `,children:[a.icon,b]})}export{m as S};
//# sourceMappingURL=StatusBadge-vdjFVlEW.js.map
