import fs from 'fs';
import fse from 'fs-extra';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import packageJson from '../package.json';
import path from 'path';
import { IAnswers, IQuestion } from './types';

(async () => {
  try {
    const question: IQuestion[] = [
      {
        type: 'input',
        message: `Please set plugin name: `,
        name: 'name',
        default: 'my-plugin',
      },
      {
        type: 'input',
        message: `Please set plugin description: `,
        name: 'description',
        default: 'Description',
      },
      {
        type: 'input',
        message: `Please set plugin keywords: `,
        name: 'keywords',
        default: '',
      },
      {
        type: 'input',
        message: `Please set plugin version: `,
        name: 'version',
        default: '0.0.1',
      },
    ];
    const copyRoot: string = './plugin-temp';
    const outRoot: string = './packages';

    function renderPlugin(dir: string, outDir: string, answers: IAnswers) {
      return new Promise((resolve, reject) => {
        let file = path.join(dir);
        let outFile = path.join(outDir, answers.name);

        if (answers.name) {
          fs.access(outFile, (error: any) => {
            if (error) {
              fs.mkdir(outFile, { recursive: true }, async (error: any) => {
                if (error) {
                  reject(false);
                } else {
                  resolve(true);
                  let newFilePath = `${process.cwd()}/${outFile}/package.json`;
                  // copy plugin-temp
                  await fse.copy(file, outFile);
                  // transfer content
                  transferContent(newFilePath, answers);
                }
              });
            } else {
              ora().warn('发生错误，项目已存在');
              reject(false);
            }
          });
        }
      });
    }
    //转换文件内容
    function transferContent(
      newFilePath: fs.PathOrFileDescriptor,
      answers: IAnswers
    ) {
      fs.readFile(newFilePath, (err: any, data: { toString: () => string }) => {
        if (err) throw err;
        let _data = JSON.parse(data.toString());
        _data.name = answers.name;
        _data.description = answers.description;
        _data.version = answers.version;
        _data.keywords = answers.keywords.split('');
        _data.homepage = `${packageJson.homepage}/${answers.name}#readme`;
        _data.bugs = {
          url: `${packageJson.homepage}/issues`,
        };
        _data.repository = {
          type: 'git',
          url: `git+${packageJson.homepage}.git`,
        };
        let str = JSON.stringify(_data, null, 4);
        fs.writeFile(newFilePath, str, (err: any) => {
          if (err) throw err;
          process.exit();
        });
      });
    }
    const answers = await inquirer.prompt(question);
    await renderPlugin(copyRoot, outRoot, answers);
    const spinner = ora('正在从plugin-temp复制...').start();
    spinner.clear();
    console.info('');
    console.info(
      chalk.green('-----------------------------------------------------')
    );
    console.info('');
    spinner.succeed('项目创建成功,请继续进行以下操作:');
    console.info('');
    console.info(chalk.cyan(` -  cd ${answers.name}`));
    console.info(chalk.cyan(` -  pnpm install`));
    console.info(chalk.cyan(` -  pnpm dev`));
    console.info('');
    console.info(
      chalk.green('-----------------------------------------------------')
    );
    console.info('');
  } catch (error) {
    process.exit();
  }
})();
