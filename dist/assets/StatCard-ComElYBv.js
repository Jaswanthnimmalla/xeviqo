import{j as e,a1 as o}from"./index-D4swEKi7.js";const n={violet:{iconBg:"bg-violet-100 dark:bg-violet-500/20",iconColor:"text-violet-600 dark:text-violet-400",border:"border-violet-200 dark:border-violet-500/20",glow:"shadow-violet-500/10"},blue:{iconBg:"bg-blue-100 dark:bg-blue-500/20",iconColor:"text-blue-600 dark:text-blue-400",border:"border-blue-200 dark:border-blue-500/20",glow:"shadow-blue-500/10"},green:{iconBg:"bg-emerald-100 dark:bg-emerald-500/20",iconColor:"text-emerald-600 dark:text-emerald-400",border:"border-emerald-200 dark:border-emerald-500/20",glow:"shadow-emerald-500/10"},amber:{iconBg:"bg-amber-100 dark:bg-amber-500/20",iconColor:"text-amber-600 dark:text-amber-400",border:"border-amber-200 dark:border-amber-500/20",glow:"shadow-amber-500/10"},pink:{iconBg:"bg-pink-100 dark:bg-pink-500/20",iconColor:"text-pink-600 dark:text-pink-400",border:"border-pink-200 dark:border-pink-500/20",glow:"shadow-pink-500/10"},red:{iconBg:"bg-red-100 dark:bg-red-500/20",iconColor:"text-red-600 dark:text-red-400",border:"border-red-200 dark:border-red-500/20",glow:"shadow-red-500/10"},cyan:{iconBg:"bg-cyan-100 dark:bg-cyan-500/20",iconColor:"text-cyan-600 dark:text-cyan-400",border:"border-cyan-200 dark:border-cyan-500/20",glow:"shadow-cyan-500/10"},indigo:{iconBg:"bg-indigo-100 dark:bg-indigo-500/20",iconColor:"text-indigo-600 dark:text-indigo-400",border:"border-indigo-200 dark:border-indigo-500/20",glow:"shadow-indigo-500/10"}},s=()=>e.jsxs("div",{className:"animate-pulse",children:[e.jsx("div",{className:"h-8 w-24 rounded bg-slate-200 dark:bg-slate-700 mb-3"}),e.jsx("div",{className:"h-4 w-32 rounded bg-slate-200 dark:bg-slate-700"})]}),g=({label:d,value:a,icon:t,color:i="violet",loading:l=!1})=>{const r=n[i];return e.jsxs(o.div,{whileHover:{y:-5,scale:1.02},transition:{duration:.25},className:`
        relative
        overflow-hidden
        rounded-2xl
        border
        ${r.border}
        bg-white
        dark:bg-[#1E293B]
        p-5
        shadow-sm
        ${r.glow}
        hover:shadow-xl
        transition-all
        duration-300
      `,children:[e.jsx("div",{className:"absolute right-0 top-0 h-24 w-24 rounded-full bg-gradient-to-br from-white/20 to-transparent blur-2xl"}),e.jsxs("div",{className:"flex items-start justify-between",children:[e.jsx("div",{className:"flex-1",children:l?e.jsx(s,{}):e.jsxs(e.Fragment,{children:[e.jsx("h3",{className:"text-3xl font-bold tracking-tight text-slate-900 dark:text-white",children:a}),e.jsx("p",{className:"mt-2 text-sm font-medium text-slate-500 dark:text-slate-400",children:d})]})}),e.jsx("div",{className:`
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            ${r.iconBg}
          `,children:e.jsx(t,{className:`h-7 w-7 ${r.iconColor}`})})]}),e.jsx("div",{className:"mt-5 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700",children:e.jsx(o.div,{initial:{width:0},animate:{width:"100%"},transition:{duration:1.2},className:"h-full rounded-full bg-gradient-to-r from-[#6C63FF] via-[#7C6BFF] to-[#9F7AEA]"})})]})};export{g as S};
//# sourceMappingURL=StatCard-ComElYBv.js.map
