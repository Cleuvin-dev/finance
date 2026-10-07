'use client';
import {useEffect,useState} from 'react';
import {Moon,Sun} from 'lucide-react';
export default function ThemeToggle(){
 const [dark,setDark]=useState(false);
 useEffect(()=>{let preferred='';try{preferred=localStorage.getItem('financas-theme')||'';}catch{}const active=preferred==='dark'||(!preferred&&window.matchMedia('(prefers-color-scheme: dark)').matches);setDark(active);document.documentElement.dataset.theme=active?'dark':'light';},[]);
 function toggle(){const active=!dark;setDark(active);document.documentElement.dataset.theme=active?'dark':'light';try{localStorage.setItem('financas-theme',active?'dark':'light');}catch{}}
 return <button type="button" className="outline theme-toggle" onClick={toggle} aria-label={dark?'Ativar modo claro':'Ativar modo escuro'} aria-pressed={dark} title={dark?'Ativar modo claro':'Ativar modo escuro'}>{dark?<Sun size={17}/>:<Moon size={17}/>}<span>{dark?'Modo claro':'Modo escuro'}</span></button>;
}
