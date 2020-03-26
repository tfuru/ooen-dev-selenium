const fs = require('fs');
const { promisify } = require('util');
const webdriver = require('selenium-webdriver');
const { Builder, By, until } = webdriver;

const browser = (process.argv.length === 0)? 'chrome' : process.argv[2];

let chrome = require('selenium-webdriver/chrome');
let chromedriver = require('chromedriver');
chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());

const capabilitiesOptions = {
    args: [
        '--headless',
        '--no-sandbox',
        '--disable-gpu',
        `--window-size=1980,1200`
    ]
};

const safariCapabilities = webdriver.Capabilities.safari();
safariCapabilities.set('safariOptions', capabilitiesOptions);

const chromeCapabilities = webdriver.Capabilities.chrome();
chromeCapabilities.set('chromeOptions', capabilitiesOptions);

const capabilities = {
    'chrome': chromeCapabilities,
    'safari': safariCapabilities
};

const Config = {
    url: 'https://dev.ooen.me/',
    user: {name: 'ConnectedDoll', password: 'dxjp4s5J'},
    capabilities: capabilities[browser]
};

const takeScreenshot = async function (driver) {
    let base64 = await driver.takeScreenshot();
    let buffer = Buffer.from(base64, 'base64');

    // bufferを保存
    const fileName = 'screenshot/' + (new Date()).getTime() + '.jpg';
    await promisify(fs.writeFile)(fileName, buffer);

    return Promise.resolve({status: 'ok'});
};

const click = async function (driver, id) {
    if (browser === 'safari') {
        const elem = await driver.findElement(By.id(id));
        await driver.executeScript("arguments[0].click();", elem);
    } else if (browser === 'chrome') {
        await driver.findElement(By.id(id)).click();    
    }
    return Promise.resolve({status: 'ok'});    
};

const wait = async function (driver, sec) {
    const w = async ele => await driver.wait(ele, sec * 1000);
    return Promise.resolve({status: 'ok'});
};

// awaitを使うので、asyncで囲む
(async () => {

    // ブラウザ立ち上げ
    const driver = await new Builder().withCapabilities(Config.capabilities).build();
    /*
    const driver = new Builder()
                        .usingServer('http://192.168.99.103:4444/wd/hub')
                        .withCapabilities( capabilities )
                        .build();
    */
    // サイトへ移動
    console.log('url', Config.url);
    await driver.get( Config.url );

    // 要素が表示されるまで待つ
    await driver.wait(until.elementLocated(By.id('btnSignIn')), 10000);

    await driver.findElement(By.id("btnSignIn")).click();

    // 要素が表示されるまで待つ
    await driver.wait(until.elementLocated(By.id('allow')), 10000);
    await driver.findElement(By.id("username_or_email")).sendKeys( Config.user.name );
    await driver.findElement(By.id("password")).sendKeys( Config.user.password );
    wait(driver, 3);

    // safari の場合 javascript click 実行
    await click(driver, 'allow');

    await driver.wait(until.elementLocated(By.className('screenName')), 30 * 1000);
    wait(driver, 30);

    // 画面キャプチャ
    await takeScreenshot(driver);

    // ブラウザ終了
    driver.quit();

})();