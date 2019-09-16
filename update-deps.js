var child_process = require('child_process');
var fs = require('fs');
var readline = require('readline');
require('colors');
var command = 'npm install';
var askUser = function (question) {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(function (resolve) {
        rl.question(question.bold, function (res) {
            rl.close;
            resolve(res);
        });
    });
};
var wipeDeps = function () {
    var file = fs.readFileSync('package.json');
    var content = JSON.parse(file);
    var deps = Object.keys(content.dependencies);
    var devDeps = Object.keys(content.devDependencies);
    if (devDeps.length) {
        devDeps.forEach(function (v) { return (command += " " + v + "@latest"); });
        command += ' -D';
    }
    if (devDeps.length && deps.length)
        command += ' && npm install';
    if (deps.length)
        deps.forEach(function (v) { return (command += " " + v + "@latest"); });
    if (command.length < 12)
        return;
    child_process.spawn(command, {
        shell: true,
        cwd: __dirname,
        stdio: 'inherit'
    });
};
if (require.main == module)
    askUser('Note: you are updating node modules to latest version\nWhich might effect your code stability! continue? [y/N]').then(function (res) {
        if (['y', 'yes'].includes(res.toLowerCase()))
            wipeDeps();
        else {
            console.log('Abort!');
            process.exit(0);
        }
    });
else
    module.exports = wipeDeps;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLWRlcHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1cGRhdGUtZGVwcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDL0MsSUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNyQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFbEIsSUFBSSxPQUFPLEdBQUcsYUFBYSxDQUFDO0FBRTVCLElBQU0sT0FBTyxHQUFHLFVBQUMsUUFBZ0I7SUFDL0IsSUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQztRQUNsQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7UUFDcEIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO0tBQ3ZCLENBQUMsQ0FBQztJQUNILE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBQSxPQUFPO1FBQ3hCLEVBQUUsQ0FBQyxRQUFRLENBQU8sUUFBUyxDQUFDLElBQUksRUFBRSxVQUFDLEdBQVc7WUFDNUMsRUFBRSxDQUFDLEtBQUssQ0FBQztZQUNULE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNmLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUM7QUFDRixJQUFNLFFBQVEsR0FBRztJQUNmLElBQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDN0MsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqQyxJQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMvQyxJQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUVyRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7UUFDbEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsT0FBTyxJQUFJLE1BQUksQ0FBQyxZQUFTLENBQUMsRUFBM0IsQ0FBMkIsQ0FBQyxDQUFDO1FBQ2xELE9BQU8sSUFBSSxLQUFLLENBQUM7S0FDbEI7SUFDRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU07UUFBRSxPQUFPLElBQUksaUJBQWlCLENBQUM7SUFDaEUsSUFBSSxJQUFJLENBQUMsTUFBTTtRQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLE9BQU8sSUFBSSxNQUFJLENBQUMsWUFBUyxDQUFDLEVBQTNCLENBQTJCLENBQUMsQ0FBQztJQUVoRSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsRUFBRTtRQUFFLE9BQU87SUFDaEMsYUFBYSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUU7UUFDM0IsS0FBSyxFQUFFLElBQUk7UUFDWCxHQUFHLEVBQUUsU0FBUztRQUNkLEtBQUssRUFBRSxTQUFTO0tBQ2pCLENBQUMsQ0FBQztBQUVMLENBQUMsQ0FBQztBQUVGLElBQUksT0FBTyxDQUFDLElBQUksSUFBSSxNQUFNO0lBQ3hCLE9BQU8sQ0FDTCxnSEFBZ0gsQ0FDakgsQ0FBQyxJQUFJLENBQUMsVUFBQyxHQUFXO1FBQ2pCLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUFFLFFBQVEsRUFBRSxDQUFDO2FBQ3BEO1lBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN0QixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO0lBQ0gsQ0FBQyxDQUFDLENBQUM7O0lBQ0EsTUFBTSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMifQ==