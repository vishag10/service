'use client'
import React, { useState, useEffect } from 'react'
import App from './components/App'
import DeskTop from './components/Desktop'
import { deatiledService } from '@/services/commonapi/commonApi';

export default function Page({ params }: { params: Promise<{ city: string; name: string; subcategoryId: string }> }) {
  const [isMobile, setIsMobile] = useState(false)
  const [resolvedParams, setResolvedParams] = useState<{ city: string; name: string; subcategoryId: string } | null>(null)
  const [decodedName, setDecodedName] = useState('');
  const [serviceId, setserviceId] = useState('');
  useEffect(() => {
    params.then(p => {
      const decodeParam = (param: string) => {
        try {
          return decodeURIComponent(param).replace(/\+/g, ' ').replace(/-/g, ' ')
        } catch {
          return param.replace(/\+/g, ' ').replace(/%20/g, ' ').replace(/-/g, ' ')
        }
      }
      
      
      const decodedName = decodeParam(p.name)
      setDecodedName(decodedName)
      setResolvedParams({
        city: decodeParam(p.city || ''),
        name: decodeParam(p.name || ''),
        subcategoryId: decodeParam(p.subcategoryId || '')
      })
    })
  }, [params])

  const getServiceId = async() => {
    try {
      const res=await deatiledService(decodedName);
      if(res.success){
        const subCategoryId =res.data?.subCategories[0]?.id;
        setserviceId(subCategoryId );
      }
    } catch (error) {
      
    }
    
  }
  useEffect(() => {
    if (decodedName) {
      getServiceId();
    }
  }, [decodedName])
        
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window?.innerWidth < 768)
    }
    
    checkMobile()
    window?.addEventListener('resize', checkMobile)
    
    return () => window?.removeEventListener('resize', checkMobile)
  }, [])
  
  if (!resolvedParams) return null
  
  return (
    <div>
      {isMobile ? <App id={serviceId} /> : <DeskTop id={serviceId} />}
    </div>
  )
}