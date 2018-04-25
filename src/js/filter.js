'use strict';

export default function filter(list, filterID) {
  switch (filterID) {
    case 'filter-popular':
      return list.sort((a, b) => b.likes - a.likes);
    case 'filter-new':
      return list
        .filter(item => new Date() - item.created <= 3 * 24 * 3600 * 1000)
        .sort((a, b) => b.created - a.created);
    case 'filter-discussed':
      return list.sort((a, b) => b.comments - a.comments);
  }
  return list;
}
