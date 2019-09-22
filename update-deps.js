"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const fs = require("fs");
const readline = require('readline');
require('colors');
let command = 'npm install';
const askUser = (question) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve => {
        rl.question(question.bold, (res) => {
            rl.close;
            resolve(res);
        });
    });
};
const wipeDeps = () => {
    const file = fs.readFileSync('package.json');
    const content = JSON.parse(file.toString());
    const deps = Object.keys(content.dependencies);
    const devDeps = Object.keys(content.devDependencies);
    if (devDeps.length) {
        devDeps.forEach(v => (command += ` ${v}@latest`));
        command += ' -D';
    }
    if (devDeps.length && deps.length)
        command += ' && npm install';
    if (deps.length)
        deps.forEach(v => (command += ` ${v}@latest`));
    if (command.length < 12)
        return;
    child_process.spawn(command, {
        shell: true,
        cwd: __dirname,
        stdio: 'inherit'
    });
};
if (require.main == module)
    askUser('Note: you are updating node modules to latest version\nWhich might effect your code stability! continue? [y/N]').then((res) => {
        if (['y', 'yes'].includes(res.toLowerCase()))
            wipeDeps();
        else {
            console.log('Abort!');
            process.exit(0);
        }
    });
else
    module.exports = wipeDeps;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLWRlcHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1cGRhdGUtZGVwcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtDQUErQztBQUMvQyx5QkFBeUI7QUFDekIsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3JDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUVsQixJQUFJLE9BQU8sR0FBRyxhQUFhLENBQUM7QUFFNUIsTUFBTSxPQUFPLEdBQUcsQ0FBQyxRQUFnQixFQUFFLEVBQUU7SUFDbkMsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQztRQUNsQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7UUFDcEIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO0tBQ3ZCLENBQUMsQ0FBQztJQUNILE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDM0IsRUFBRSxDQUFDLFFBQVEsQ0FBTyxRQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBVyxFQUFFLEVBQUU7WUFDaEQsRUFBRSxDQUFDLEtBQUssQ0FBQztZQUNULE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNmLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUM7QUFDRixNQUFNLFFBQVEsR0FBRyxHQUFHLEVBQUU7SUFDcEIsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUM3QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQzVDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQy9DLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBRXJELElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtRQUNsQixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDbEQsT0FBTyxJQUFJLEtBQUssQ0FBQztLQUNsQjtJQUNELElBQUksT0FBTyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTTtRQUFFLE9BQU8sSUFBSSxpQkFBaUIsQ0FBQztJQUNoRSxJQUFJLElBQUksQ0FBQyxNQUFNO1FBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBRWhFLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxFQUFFO1FBQUUsT0FBTztJQUNoQyxhQUFhLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRTtRQUMzQixLQUFLLEVBQUUsSUFBSTtRQUNYLEdBQUcsRUFBRSxTQUFTO1FBQ2QsS0FBSyxFQUFFLFNBQVM7S0FDakIsQ0FBQyxDQUFDO0FBRUwsQ0FBQyxDQUFDO0FBRUYsSUFBSSxPQUFPLENBQUMsSUFBSSxJQUFJLE1BQU07SUFDeEIsT0FBTyxDQUNMLGdIQUFnSCxDQUNqSCxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQVcsRUFBRSxFQUFFO1FBQ3JCLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUFFLFFBQVEsRUFBRSxDQUFDO2FBQ3BEO1lBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN0QixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO0lBQ0gsQ0FBQyxDQUFDLENBQUM7O0lBQ0EsTUFBTSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMifQ==