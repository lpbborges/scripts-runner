/**
 * Counts from start to 5
 * @param start The value it will start the counting
 */
export function main(start: number) {
  console.log("Starting TS counter...");
  let count: number = start;
  const interval = setInterval(() => {
    count++;
    console.log(`Count is now: ${count}`);
    if (count >= 5) {
      console.log("Counter finished!");
      clearInterval(interval);
    }
  }, 500);
}
