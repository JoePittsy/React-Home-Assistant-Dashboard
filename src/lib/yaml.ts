import yaml from 'js-yaml'
import type { AppConfig } from '@/config/types'

export async function loadConfig(): Promise<AppConfig> {
  const res = await fetch('/dashboard.yaml')
  if (!res.ok) {
    throw new Error(
      `Failed to load dashboard.yaml: ${res.status} ${res.statusText}. ` +
      `Make sure the file exists in the public/ directory.`
    )
  }
  const text = await res.text()
  let parsed: unknown
  try {
    parsed = yaml.load(text)
  } catch (e) {
    throw new Error(`Failed to parse dashboard.yaml: ${e instanceof Error ? e.message : String(e)}`)
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('dashboard.yaml is empty or not a valid YAML object')
  }
  const config = parsed as AppConfig
  if (!config.ha?.url || !config.ha?.token) {
    throw new Error('dashboard.yaml is missing required ha.url or ha.token fields')
  }
  if (!config.dashboard?.pages?.length) {
    throw new Error('dashboard.yaml must have at least one page under dashboard.pages')
  }
  return config
}
