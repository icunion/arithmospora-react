# arithmospora-react
> React hooks and utilities for connecting [Arithmospora](https://github.com/icunion/arithmospora) to a [Redux](https://redux.js.org/) state slice

Does exactly what it says on the tin. This library has been split off from [election-stats-icu](https://github.com/icunion/election-stats-icu) to facilitate use in projects independently from the component library.

## Install

```bash
npm install --save arithmospora-react
```

## Usage

TODO:

- [ ] Rewrite this with more useful clues

Setup and usage is essentially the same as in [election-stats-icu](https://github.com/icunion/election-stats-icu), with imports adjusted accordingly. The key difference is configuration handling: unlike election-stats-icu, this library allows the config to be selected at runtime and additional configs to be specified. Two config profiles are included, `icu-dev` and `icu-production`, which include the websocket URLs and stats sources for icu's dev and production arithmospora instances. `icu-dev` is used by default, but `icu-production` can be selected as follows:

```js
import { selectConfig } from 'arithmospora-react'

selectConfig('icu-production')
```

You can supply a custom config using `addConfig`. Only one config can be used at a time, selecting a new config will cause all connected sockets to be disconnected and reconnected to the arithmospora instance specified in the selected config.

## Contact

Email: ICU Systems Team [icu.systems@imperial.ac.uk](mailto:icu.systems@imperial.ac.uk)

## License

MIT © [Imperial College Union](https://www.imperialcollegeunion.org)
