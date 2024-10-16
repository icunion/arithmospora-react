import { ConfigSet, Config } from './interfaces'

const configsDefault: ConfigSet = {
  'icu-dev': {
    "arithmosporaUrl": "wss://www.imperialcollegeunion.org/sys-arithmospora-dev",
    "sources": {
      "le2022": { "path": "dev" },
      "le2022csps": { "path": "le2017" },
      "le2023": { "path": "dev" },
      "le2023csps": { "path": "le2017" },
      "le2024": { "path": "dev" },
      "le2024csps": { "path": "le2017" },
      "se2022": { "path": "dev" },
      "se2022csps": { "path": "le2017" },
      "ae2022": { "path": "dev" },
      "ae2023": { "path": "dev" },
      "ae2024": { "path": "dev" },
    }
  },
  'icu-production': {
    "arithmosporaUrl": "wss://www.imperialcollegeunion.org/sys-arithmospora",
    "sources": {
      "le2021": { "path": "le2021" },
      "le2021csps": { "path": "le2021csps" },
      "le2022": { "path": "le2022" },
      "le2022csps": { "path": "le2022csps" },
      "le2023": { "path": "le2023" },
      "le2023csps": { "path": "le2023csps" },
      "le2024": { "path": "le2024" },
      "le2024csps": { "path": "le2024csps" },
      "se2022": { "path": "se2022" },
      "se2022csps": { "path": "se2022csps" },
      "ae2022": { "path": "ae2022" },
      "ae2023": { "path": "ae2023" },
      "ae2024": { "path": "ae2024" },
    }
  }
}

export default configsDefault
