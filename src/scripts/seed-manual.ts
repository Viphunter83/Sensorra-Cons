
import { seedCatalog } from '../actions/seed-catalog';

async function main() {
    console.log("Running manual seed...");
    try {
        await seedCatalog();
        console.log("Done!");
    } catch (e) {
        console.error(e);
    }
}

main();
