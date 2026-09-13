import { runAutoUpdater } from './auto_updater.js';

// Parse command line arguments
const args = process.argv.slice(2);
let intervalMinutes = 30; // default 30 minutes
let mode = 'standard';

args.forEach(arg => {
  if (arg.startsWith('--interval=')) {
    const val = parseInt(arg.split('=')[1], 10);
    if (!isNaN(val) && val > 0) intervalMinutes = val;
  }
  if (arg.startsWith('--mode=')) {
    mode = arg.split('=')[1];
  }
});

const intervalMs = intervalMinutes * 60 * 1000;
let isRunning = false;
let runCount = 0;

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║       FILMX AVTOMATIK YANGILANISH DAEMONI (WATCHER)           ║');
console.log('╚═══════════════════════════════════════════════════════════════╝');
console.log(`[WATCHER] Rejim: ${mode.toUpperCase()}`);
console.log(`[WATCHER] Interval: Har ${intervalMinutes} daqiqada yangiliklar tekshiriladi`);
console.log(`[WATCHER] To'xtatish uchun: Ctrl + C bosing\n`);

async function performCheck() {
  if (isRunning) {
    console.log(`[WATCHER] Oldingi yangilanish hali yakunlanmadi. Kutilmoqda...`);
    return;
  }

  isRunning = true;
  runCount++;

  console.log(`\n-------------------------------------------------------------`);
  console.log(`[WATCHER RUN #${runCount}] Tekshiruv boshlandi: ${new Date().toLocaleTimeString('uz-UZ')}`);
  console.log(`-------------------------------------------------------------`);

  try {
    const result = await runAutoUpdater({ mode });
    console.log(`[WATCHER RUN #${runCount}] Muvaffaqiyatli yakunlandi: ${result.newMoviesAdded} yangi kino, ${result.newSeriesAdded} yangi serial qo'shildi.`);
  } catch (error) {
    console.error(`[WATCHER RUN #${runCount} XATOLIK]`, error.message);
  } finally {
    isRunning = false;
    const nextTime = new Date(Date.now() + intervalMs).toLocaleTimeString('uz-UZ');
    console.log(`[WATCHER] Keyingi tekshiruv vaqti: ${nextTime} (${intervalMinutes} daqiqadan so'ng)\n`);
  }
}

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\n[WATCHER] To\'xtatish buyrug\'i qabul qilindi (SIGINT). FilmX daemoni to\'xtatildi.');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[WATCHER] FilmX daemoni to\'xtatildi (SIGTERM).');
  process.exit(0);
});

// Run initial check immediately on start
performCheck();

// Schedule recurring executions
setInterval(performCheck, intervalMs);
