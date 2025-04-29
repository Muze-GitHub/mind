import { zzFetch } from '../zzfetch'

export const getWorkFlowParamsApi = async () => {
  return zzFetch('get', '/parameters')
}

export const runWorkFlowApi = async (
  data: any,
  onStream?: (data: any) => void
) => {
  return zzFetch('post', '/workflows/run', {
    body: data,
    isStream: true,
    onStream
  })
}
