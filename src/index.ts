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
        type: 'list',
        message: `Please choose plugin template type:`,
        name: 'type',
        choices: ['pnpm-tsup', 'rollup-ts'],
      },
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

    const outRoot: string = './packages';

    function renderPlugin(outDir: string, answers: IAnswers) {
      return new Promise((resolve, reject) => {
        let dir: string = `./${answers.type}`;
        let file: string = path.join(dir);
        let outFile: string = path.join(outDir, answers.name);

        if (answers.name) {
          fs.access(outFile, (error: any) => {
            if (error) {
              fs.mkdir(outFile, { recursive: true }, async (error: any) => {
                if (error) {
                  reject(false);
                } else {
                  resolve(true);
                  let newFilePath: string = `${process.cwd()}/${outFile}/package.json`;

                  // 模版dist/node_modules判断是否存在
                  const distFile = path.join(dir, 'dist');
                  const nodeModulesFile = path.join(dir, '..', 'node_modules');
                  fs.access(distFile, (error: any) => {
                    // 模版存在dist文件夹，则删除
                    if (!error) {
                      fs.rmdirSync(distFile, {
                        recursive: true,
                      });
                    }
                  });
                  fs.access(nodeModulesFile, (error: any) => {
                    // 模版存在node_modules文件夹，则删除
                    if (!error) {
                      fs.rmdirSync(nodeModulesFile, {
                        recursive: true,
                      });
                    }
                  });
                  // copy plugin-temp
                  await fse.copy(file, outFile);
                  // transfer content
                  transferContent(newFilePath, answers);

                  console.info('');
                  console.info(
                    chalk.green(
                      '-----------------------------------------------------'
                    )
                  );
                  console.info('');
                  spinner.succeed('项目创建成功,请继续进行以下操作:');
                  console.info('');
                  console.info(chalk.cyan(` -  cd ${answers.name}`));
                  console.info(chalk.cyan(` -  pnpm install`));
                  console.info(chalk.cyan(` -  pnpm dev`));
                  console.info('');
                  console.info(
                    chalk.green(
                      '-----------------------------------------------------'
                    )
                  );
                  console.info('');
                }
              });
            } else {
              ora().warn('发生错误，项目已存在');
              reject(false);
              process.exit();
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
        _data.keywords = answers.keywords.split(',');
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
    const answers: IAnswers = await inquirer.prompt(question);
    const spinner = ora('正在从plugin-temp模版中复制...').start();
    await renderPlugin(outRoot, answers);
    spinner.clear();
  } catch (error) {
    process.exit();
  }
})();
