const inquirer = require('inquirer');
const chalk = require('chalk');
const asciichart = require('asciichart');

// MODULAR IMPORTS
const linspace = require('@stdlib/array-linspace');
const erf = require('@stdlib/math-base-special-erf');
const gamma = require('@stdlib/math-base-special-gamma');
const sin = require('@stdlib/math-base-special-sin');

const PLOT_CONFIGS = {
    'Error Function (erf)': {
        fn: erf,
        defaultRange: [-3, 3],
        color: asciichart.cyan,
        desc: 'S-curve integral of the Gaussian distribution.'
    },
    'Gamma Function (gamma)': {
        fn: gamma,
        defaultRange: [0.1, 4],
        color: asciichart.magenta,
        desc: 'Generalization of the factorial function.'
    },
    'Sine Wave (sin)': {
        fn: sin,
        defaultRange: [0, 6.28], // One full period (2*PI)
        color: asciichart.blue,
        desc: 'Standard trigonometric oscillation.'
    }
};

function renderChart(name, range) {
    const config = PLOT_CONFIGS[name];
    const termWidth = process.stdout.columns || 80;
    const numPoints = termWidth - 15; 
    
    // Use the custom range provided by the user
    const xValues = linspace(range[0], range[1], numPoints);
    const yValues = [];

    for (let i = 0; i < xValues.length; i++) {
        let y = config.fn(xValues[i]);
        if (isNaN(y) || !isFinite(y)) y = 0;
        // Smart scaling for Gamma to prevent "flat-lining" the rest of the plot
        if (name.includes('Gamma')) y = Math.min(y, 20);
        yValues.push(y);
    }

    process.stdout.write('\u001b[2J\u001b[0;0H'); 
    console.log(chalk.bold.bgWhite.black(`  STDLIB EXPLORER: ${name.toUpperCase()}  `));
    console.log(chalk.cyan(`  ${config.desc}\n`));
    
    console.log(asciichart.plot(yValues, { 
        height: 14, 
        colors: [config.color] 
    }));
    
    console.log(chalk.yellow(`\n  X-Axis: ${range[0]} to ${range[1]} | Samples: ${numPoints}`));
}

async function mainMenu() {
    process.stdout.write('\u001b[2J\u001b[0;0H'); 
    console.log(chalk.bold.blue('--- stdlib Special Math Functions Visualizer --- \n'));

    const { choice } = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'Select a function:',
            choices: [...Object.keys(PLOT_CONFIGS), new inquirer.Separator(), 'Exit']
        }
    ]);

    if (choice === 'Exit') {
        console.log(chalk.green('\nExiting...\nThank you!'));
        process.exit();
    }

    const config = PLOT_CONFIGS[choice];

    // NEW: Interactive Range Selection
    const { useDefault } = await inquirer.prompt([{
        type: 'confirm',
        name: 'useDefault',
        message: `Use default range [${config.defaultRange[0]}, ${config.defaultRange[1]}]?`,
        default: true
    }]);

    let finalRange = config.defaultRange;

    if (!useDefault) {
        const rangeAnswers = await inquirer.prompt([
            {
                type: 'input',
                name: 'min',
                message: 'Enter start value (min X):',
                default: config.defaultRange[0],
                validate: value => !isNaN(parseFloat(value)) || 'Please enter a number'
            },
            {
                type: 'input',
                name: 'max',
                message: 'Enter end value (max X):',
                default: config.defaultRange[1],
                validate: value => !isNaN(parseFloat(value)) || 'Please enter a number'
            }
        ]);
        finalRange = [parseFloat(rangeAnswers.min), parseFloat(rangeAnswers.max)];
    }

    renderChart(choice, finalRange);

    const { back } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'back',
            message: '\nView another function or range?',
            default: true
        }
    ]);

    if (back) await mainMenu();
    else{
     console.log(chalk.yellow('\nExiting...\nThank you!'))
     process.exit();
    }    
}

mainMenu().catch(err => console.error(err));