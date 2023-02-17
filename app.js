    const express = require('express');
    const line  = require('@line/bot-sdk');
    // const openai = require('openai');
    const { Configuration, OpenAIApi } = require("openai");
    const apiVersion = '2022-01-26';
    const timeout = 30000;

    const config  = {
        channelAccessToken: 'ivRbthGsFusO4t+nBz4N5dFP6kHFAXFJEW8+D0RlQC1domS6qH1huJwnsSSomwkfBnYHSXlrJFP1B3QyC/1nG6hpLrDJccUYsPzYYP4zBG5QIphGlXGRtpTQTqWldDx+TCPbyJAa8r9drnwrZPIHvAdB04t89/1O/w1cDnyilFU=',
        channelSecret: '8210401523a1d3b6413857216ba2cd92'
    }

    const client = new line.Client(config);

    const app = express();

    const OPENAI_API_KEY='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'

    const configuration = new Configuration({
        apiKey: OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    openai.apiVersion = apiVersion;
    openai.timeout = timeout;
    
    app.post('/webhook', line.middleware(config), (req, res) => {
        Promise.all(req.body.events.map(handleEvent))
            .then((result) => res.json(result))
            .catch((err) => {
                console.error(err);
                res.status(500).end();
            });
        });
        
    const handleEvent = async(event) =>{
        if (event.type !== 'message' || event.message.type !== 'text') {
            return Promise.resolve(null);
        }
        
        const message = {
            type: 'text',
            text: await chatgpt(event.message.text) //回覆的訊息
            // text: '你好呀朋友' //回覆的訊息
        };
        console.log('replyMessage is ==',message)
        return client.replyMessage(event.replyToken, message);
    }

    
    const chatgpt = async (userInput) => {
        console.log('userInput is ',userInput)
        try {
            const completion = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: userInput,
                temperature:0.5,
                max_tokens:2048,
                top_p:1,
                frequency_penalty:0.0,
                presence_penalty:0.0,
            });
            // 取得最佳的回覆
            console.log('original completion is ==',completion.data)
            console.log('response is = ',completion.data.choices[0].text);
            let result = completion.data.choices[0].text.trim()
            return result
        } catch (error) {
            if (error.response) {
                console.log('error.response.status = ',error.response.status);
                console.log('error.response.data = ',error.response.data);
            } else {
                console.log('error.message = ',error.message);
            }
        };
    }

    app.listen(process.env.PORT || 3000, () => {
        console.log('LINE Bot server is running!');
    });
    