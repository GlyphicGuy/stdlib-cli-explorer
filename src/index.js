const inquirer = require('inquirer');
const chalk = require('chalk');
const asciichart = require('asciichart');

// MODULAR IMPORTS (Fast start-up time)
const linspace = require('@stdlib/array-linspace');
const erf = require('@stdlib/math-base-special-erf');
const gamma = require('@stdlib/math-base-special-gamma');
const sin = require('@stdlib/math-base-special-sin');

const PLOT_CONFIGS = {
    'Error Function (erf)': {
        fn: erf,
        range: [-10, 10],
        color: asciichart.cyan,
        desc: 'S-curve integral of the Gaussian distribution.'
    },
    'Gamma Function (gamma)': {
        fn: gamma,
        range: [0.1, 3.5],
        color: asciichart.magenta,
        desc: 'Generalization of the factorial function.'
    },
    'Sine Wave (sin)': {
        fn: sin,
        range: [0, 25],
        color: asciichart.blue,
        desc: 'Standard trigonometric oscillation.'
    }
};

function renderChart(name) {
    const config = PLOT_CONFIGS[name];
    const termWidth = process.stdout.columns || 80;
    const numPoints = termWidth - 15; 
    
    const xValues = linspace(config.range[0], config.range[1], numPoints);
    const yValues = [];

    for (let i = 0; i < xValues.length; i++) {
        let y = config.fn(xValues[i]);
        if (isNaN(y) || !isFinite(y)) y = 0;
        if (name.includes('Gamma')) y = Math.min(y, 10);
        yValues.push(y);
    }

    process.stdout.write('\u001b[2J\u001b[0;0H'); 
    console.log(chalk.bold.bgWhite.black(`  STDLIB LINE EXPLORER: ${name.toUpperCase()}  `));
    console.log(chalk.cyan(`  ${config.desc}\n`));
    
    console.log(asciichart.plot(yValues, { 
        height: 12, 
        colors: [config.color] 
    }));
    
    console.log(chalk.gray(`\n  X-Axis: ${config.range[0]} to ${config.range[1]} | Points: ${numPoints}`));
}

async function mainMenu() {
    process.stdout.write('\u001b[2J\u001b[0;0H'); 
    console.log(chalk.bold.blue('--- stdlib Interactive Line Visualizer --- \n'));

    const { choice } = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'Select a function to plot:',
            choices: [...Object.keys(PLOT_CONFIGS), new inquirer.Separator(), 'Exit']
        }
    ]);

    if (choice === 'Exit') {
        console.log(chalk.green('\nShowcase complete. Thank you!'));
        process.exit();
    }

    renderChart(choice);

    // FIXED: Correctly awaiting and looping
    const { back } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'back',
            message: '\nReturn to functions menu?',
            default: true
        }
    ]);

    if (back) {
        await mainMenu(); // RECURSIVE CALL
    } else {
        console.log(chalk.yellow('\nExiting...'));
        process.exit();
    }
}

mainMenu().catch(err => console.error(err));