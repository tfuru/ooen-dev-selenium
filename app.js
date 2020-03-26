const fs = require('fs');
const { promisify } = require('util');
const webdriver = require('selenium-webdriver');
const { Builder, By, until } = webdriver;

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

const Config = {
    url: 'https://dev.ooen.me/',
    user: {name: 'ConnectedDoll', password: 'dxjp4s5J'},
    capabilities: chromeCapabilities
};

const takeScreenshot = async function (driver) {
    let base64 = await driver.takeScreenshot();
    let buffer = Buffer.from(base64, 'base64');

    // bufferを保存
    const fileName = 'screenshot/' + (new Date()).getTime() + '.jpg';
    await promisify(fs.writeFile)(fileName, buffer);

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
    const wait1 = async ele => await driver.wait(ele, 3 * 1000);

    await driver.findElement(By.id("allow")).click();
    await driver.wait(until.elementLocated(By.className('screenName')), 30 * 1000);
    
    const wait2 = async ele => await driver.wait(ele, 30 * 1000);

    // 画面キャプチャ
    await takeScreenshot(driver);

    // ブラウザ終了
    driver.quit();

})();