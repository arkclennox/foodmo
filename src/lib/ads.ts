/**
 * Adsterra ad units, copied from each unit's code in the Adsterra dashboard
 * (Websites → foodmo.id → Get code). Leave a key empty to hide that slot
 * everywhere.
 *
 * Banner code looks like:  atOptions = { 'key' : '<key>', ... }
 *                          <script src="https://<host>/<n>/<key>">
 * Native banner code:      <script async data-cfasync="false" src="https://<host>/<n>/<key>">
 *                          <div id="container-<key>"></div>
 */
export const ADSTERRA = {
  banner300x250: {
    key: 'b544bbb5d3bbafe14fa0318c4787088c',
    /** Script URL from the banner code. */
    src: 'https://bicea.org/22/b544bbb5d3bbafe14fa0318c4787088c',
  },
  native: {
    key: '334d088cd4c14adffe0cc975919784e4',
    /** Script URL from the native banner code. */
    src: 'https://bicea.org/21/334d088cd4c14adffe0cc975919784e4',
  },
} as const;
