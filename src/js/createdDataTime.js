const twoWeeks = 2 * 7 * 24 * 60 * 60 * 1000;

const getRandTimestampInRange = range =>
  Date.now() - parseInt(Math.random() * range);

const preprocessRec = (timestamp, rec) =>
  Object.assign({ created: timestamp }, rec);

export default function createdDataTime(list) {
  return list.map(rec => preprocessRec(getRandTimestampInRange(twoWeeks), rec));
}
