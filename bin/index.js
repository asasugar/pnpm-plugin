#!/usr/bin/env node --experimental-modules
import fs from 'fs';
import { Command } from 'commander'; //可以解析用户输入的命令
import download from 'obtain-git-repo';
import chalk from 'chalk'; //改变输出文字的颜色
import inquirer from 'inquirer';
import ora from 'ora'; //小图标（loading、succeed、warn等）
download('', '', {}, () => { });
import packageJSON from '../package.json';
const program = new Command();

const question = [
  {
    type: 'list',
    message: `请选择开发项目的语言? `,
    name: 'type',
    choices: ['TypeScript'],
  },
  {
    type: 'input',
    message: `项目名称: `,
    name: 'name',
    default: 'my-plugin',
  },
  {
    type: 'input',
    message: `项目描述: `,
    name: 'description',
    default: '',
  },
  {
    type: 'input',
    message: `初始版本: `,
    name: 'version',
    default: '1.0.0',
  },
];

program
  .version(packageJSON.version, '-v, --version')
  .command('init <pkgName>')
  .action(async (pkgName) => {
    if (fs.existsSync(pkgName)) {
      console.log(chalk.red('项目已存在'));
      return;
    }
    const { type, name, description, version } = await inquirer.prompt(
      question
    );
    let downloadUrl = '';

    if (type === 'TypeScript') {
      downloadUrl = 'asasugar/plugin-tstemp';
    }

    const spinner = ora('正在从github下载...').start();
    download(downloadUrl, name, {}, function (err) {
      if (!err) {
        spinner.clear();
        console.info('');
        console.info(
          chalk.green('-----------------------------------------------------')
        );
        console.info('');
        spinner.succeed('项目创建成功,请继续进行以下操作:');
        console.info('');
        console.info(
          chalk.gray('安装pnpm参考文档: https://github.com/pnpm/pnpm')
        );
        console.info('');
        console.info(chalk.cyan(` -  cd ${name}`));
        console.info(chalk.cyan(` -  pnpm install`));
        console.info(chalk.cyan(` -  pnpm dev`));
        console.info(chalk.cyan(` -  pnpm build`));
        console.info('');
        console.info(
          chalk.gray('参考文档: https://github.com/asasugar/pkg-cli/')
        );
        console.info('');
        console.info(
          chalk.green('-----------------------------------------------------')
        );
        console.info('');

        fs.readFile(`${process.cwd()}/${name}/package.json`, (err, data) => {
          if (err) throw err;
          let _data = JSON.parse(data.toString());
          _data.name = name;
          _data.description = description;
          _data.version = version;
          let str = JSON.stringify(_data, null, 4);
          fs.writeFile(
            `${process.cwd()}/${name}/package.json`,
            str,
            function (err) {
              if (err) throw err;
              process.exit();
            }
          );
        });
      } else {
        spinner.warn(
          '发生错误，请在https://github.com/asasugar/pkg-cli/issues，Issues留言'
        );
        process.exit();
      }
    });
  })
  .parse(process.argv);
