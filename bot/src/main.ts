import {
    getDoujin,
    getNewDoujin,
    getRandDoujin,
} from './backend/doujins.api.ts';
import { createLog } from './backend/logs.api.ts';
import { getSettings, updateSettings } from './backend/settings.api.ts';
import { Doujin } from './libs/types.d.ts';
import {
    addDoujin,
    checkDailyUsage,
    getUser,
    newUser,
    updateDailyUsage,
    userExists,
} from './backend/users.api.ts';
import {
    DAILY_LIMIT_REACHED_GIF,
    ERROR_GIF,
    LOG_LEVELS,
    VERSION,
    LOG_LEVELS_API,
OWNER_ID,
} from './libs/constants.ts';
import {
    Bot,
    CommandContext,
    Context,
    GrammyError,
    InlineKeyboard,
    InputFile,
    Message,
    run,
} from './libs/deps.ts';
import {
    doujinMessage,
    doujinPostingPrep,
    zipDoujin,
} from './libs/doujin_utils.ts';
import {
    BadRequestError,
    BotError,
    InvalidTagFormatError,
    NoDoujinFoundError,
    NoResultsError,
    TelegraphPostError,
} from './libs/errors.ts';
import { cleanupWorkdir, validateTags, verifyUrl } from './libs/utils.ts';

const bot = new Bot(Deno.env.get('TELEGRAM_BOT_TOKEN')!);

const jobQueue = new Map<number, number>();

/**
 * Filter for the settings command
 * @param ctx Chat context
 * @returns Whether the reply is for the settings or not
 */
const filterSettings = async (ctx: Context) => {
    // Check if the user is the owner of the bot.
    if (ctx.from?.id!.toString() !== OWNER_ID || !ctx.message?.reply_to_message?.from?.is_bot) {
        return false;
    }
    return true;
};

/**
 * This is to be able to change the settings of the bot. Normaly this is done via the API/Web interface but this is a lazy fallback for users who don't want to use the API/Web interface.
 */
bot.filter(filterSettings, async (ctx) => {
    const settings = await getSettings();
    switch (ctx.message?.reply_to_message?.text) {
        case 'Reply to this message with the new max number of files.':
            const maxFiles = parseInt(ctx.message?.text!);
            if (isNaN(maxFiles)) {
                ctx.reply('Invalid number.');
                return;
            }
            settings.max_files = maxFiles;
            await updateSettings(settings);
            ctx.reply('Max number of files updated.');
            break;
        case 'Reply to this message with the new max daily limit.':
            const maxDaily = parseInt(ctx.message?.text!);
            if (isNaN(maxDaily)) {
                ctx.reply('Invalid number.');
                return;
            }
            settings.max_daily_use = maxDaily;
            await updateSettings(settings);
            ctx.reply('Max daily limit updated.');
            break;
        case 'Reply to this message with an new ID to whitelist or to remove from the whitelist (prefix with a + or a -).':
            const id = ctx.message?.text!;
            if (id.startsWith('+')) {
                settings.whitelist.push(parseInt(id.slice(1)));
            }
            if (id.startsWith('-')) {
                settings.whitelist.splice(
                    settings.whitelist.indexOf(parseInt(id.slice(1))),
                    1
                );
            }
            await updateSettings(settings);
            ctx.reply('Whitelist updated.');
            break;
        default:
            ctx.reply('Invalid reply.');
            break;


    }
});

/** Handle the /stats command. */
bot.command('stats', async (ctx) => {
    if (!(await userExists(ctx.from?.id!))) {
        await newUser(
            ctx.from?.id!,
            ctx.from?.username,
            ctx.from?.first_name,
            ctx.from?.last_name
        );
    }
    const user = await getUser(ctx.from?.id!);
    ctx.reply(
        `Stats for @${user.username}\n\n` +
            `Total doujins fetched : *${user.doujins.length}*\n` +
            `Total times this bot was used : *${user.usage}*\n` +
            `Daily usage for ${new Date(
                user.daily_use_date
            ).toDateString()} : *${user.daily_use}*`,
        { parse_mode: 'Markdown' }
    );
});

/** Handle the /help command. */
bot.command('help', async (ctx) => {
    ctx.reply(
        `*Commands* : \n` +
            `/start - Start the bot\n` +
            `/help - Show this message\n` +
            `/stats - Show your stats\n` +
            `/info - Show bot information\n` +
            `/fetch - Get a doujin by url\n` +
            `/random - Get a random doujin\n`,
        { parse_mode: 'Markdown' }
    );
});

/** Handle the /start command. */
bot.command('start', async (ctx) => {
    const { max_daily_use } = await getSettings();
    await ctx.replyWithAnimation(
        'https://i.pinimg.com/originals/e5/ac/48/e5ac4837d9f8623076f51aadb9997df9.gif',
        {
            caption: `Hello there! *${
                '@' + ctx.from?.username || 'Anon'
            }*,\nI am a bot that can get you doujins from Ex-Hentai and E-hentai.\n*There is a ${max_daily_use} doujins a day limit!* `,
            parse_mode: 'Markdown',
        }
    );
    await newUser(
        ctx.from?.id!,
        ctx.from?.username!,
        ctx.from?.first_name!,
        ctx.from?.last_name!
    );
});

bot.command('myid',async (ctx)=>{
    ctx.reply(`Here's your ID, give it to the bot owner so he can whitelist you : ${ctx.from?.id}`)
})

bot.command('settings',async (ctx) =>{
    if(ctx.from?.id!.toString() !== OWNER_ID){
        ctx.reply("You aren't the owner of this bot, you can't change the settings...")
        return;
    }
    let inlineKeyboard = new InlineKeyboard()
    .text('Max files', `mf`)
    .text('Daily limit', `dl`)
    .row()
    .text('Whitelist', 'wl')
    .row()
    .text('Dismiss','none')
    const settings = await getSettings()
    const whitelisted_users = settings.whitelist.map((user)=>{
        return `id : ${user}\n`
    })
    ctx.reply(
        `Which settings do you want to change ?\nHere are the current settings : \n\n` + 
        `Max files : ${settings.max_files}\n` +
        `Max daily use : ${settings.max_daily_use}\n` +
        `Whitelisted users : \n ${whitelisted_users.join()}` 
    ,{
        reply_markup : inlineKeyboard
    })


})

/** Handle the /info command. */
bot.command('info', async (ctx) => {
    const { max_files, max_daily_use } = await getSettings();
    await ctx.reply(
        `This bot is made by @trueimmortal.\n` +
            `*Version* : ${VERSION}\n` +
            `Email : TelegramBotContact@proton.me\n` +
            `Max files : ${max_files}\n` +
            `Max daily use : ${max_daily_use}\n`,
        { parse_mode: 'Markdown', disable_web_page_preview: true }
    );
});

/** Handle the /fetch command. */
bot.command('fetch', async (ctx) => {
    if (!(await userExists(ctx.from?.id!))) {
        await newUser(
            ctx.from?.id!,
            ctx.from?.username,
            ctx.from?.first_name,
            ctx.from?.last_name
        );
    }
    if (await dailyLimitReached(ctx)) {
        return;
    }
    if (verifyUrl(ctx.match)) {
        if (jobQueue.has(ctx.from?.id!)) {
            await ctx.reply(
                'You already have a job running. Please wait for it to finish.'
            );
            return;
        } else {
            jobQueue.set(ctx.from?.id!, 1);
        }
        const loadingMessage = await sendLoadingAnim(ctx);
        try {
            await updateDailyUsage(ctx.from?.id!);
            const doujin = await getNewDoujin(ctx.match);
            if (doujin.telegraph_url === 'none') {
                await doujinPostingPrep(doujin);
            }
            await sendDoujin(ctx, doujin, loadingMessage);
            jobQueue.delete(ctx.from?.id!);
        } catch (error) {
            jobQueue.delete(ctx.from?.id!);
            console.error(LOG_LEVELS.ERROR, error.message);
            if (error instanceof NoResultsError) {
                await bot.api.deleteMessage(
                    loadingMessage.chat.id,
                    loadingMessage.message_id
                );
                await ctx.replyWithAnimation(ERROR_GIF, {
                    caption: 'No results found at that URL!',
                });
            }
            if (error instanceof TelegraphPostError) {
                await bot.api.deleteMessage(
                    loadingMessage.chat.id,
                    loadingMessage.message_id
                );
                await ctx.replyWithAnimation(ERROR_GIF, {
                    caption: 'Error while posting to Telegraph!',
                });
            }
            if (error instanceof BadRequestError) {
                await bot.api.deleteMessage(
                    loadingMessage.chat.id,
                    loadingMessage.message_id
                );
                await ctx.replyWithAnimation(ERROR_GIF, {
                    caption: 'That url is not valid!',
                });
            }
        }
    } else {
        await ctx.reply('Please pass a valid E-Hentai or ExHentai url!');
    }
});

/** Handle the /random command. */
bot.command('random', async (ctx) => {
    if (!(await userExists(ctx.from?.id!))) {
        await newUser(
            ctx.from?.id!,
            ctx.from?.username,
            ctx.from?.first_name,
            ctx.from?.last_name
        );
    }
    if (await dailyLimitReached(ctx)) {
        return;
    }
    if (jobQueue.has(ctx.from?.id!)) {
        await ctx.reply(
            'You already have a job running. Please wait for it to finish.'
        );
        return;
    } else {
        jobQueue.set(ctx.from?.id!, 1);
    }
    const loadingMessage = await sendLoadingAnim(ctx);
    try {
        validateTags(ctx.match);
        const randomDoujinUrl = await getRandDoujin(ctx.match);
        const doujin = await getNewDoujin(randomDoujinUrl);
        await updateDailyUsage(ctx.from?.id!);
        if (doujin.telegraph_url === 'none') {
            await doujinPostingPrep(doujin);
        }
        await sendDoujin(ctx, doujin, loadingMessage);
        jobQueue.delete(ctx.from?.id!);
    } catch (error) {
        jobQueue.delete(ctx.from?.id!);
        if (error instanceof InvalidTagFormatError) {
            await bot.api.deleteMessage(
                loadingMessage.chat.id,
                loadingMessage.message_id
            );
            await ctx.replyWithPhoto(new InputFile('./assets/taginfo.png'), {
                caption:
                    'Wrong tag format!, please refer to the image above for more info',
            });
        } else if (error instanceof NoDoujinFoundError) {
            await bot.api.deleteMessage(
                loadingMessage.chat.id,
                loadingMessage.message_id
            );
            await ctx.replyWithAnimation(ERROR_GIF, {
                caption: `No results found with the tags ${ctx.match}`,
            });
        } else if (error instanceof TelegraphPostError) {
            await bot.api.deleteMessage(
                loadingMessage.chat.id,
                loadingMessage.message_id
            );
            await ctx.replyWithAnimation(ERROR_GIF, {
                caption: 'Error while posting to Telegraph!',
            });
        } else {
            throw new Error(error.message);
        }
    }
});

/**
 * Check if the daily limit has been reached
 * @param ctx : The context of the message
 * @returns True if the daily limit is reached, false otherwise
 */
const dailyLimitReached = async (
    ctx: CommandContext<Context>
): Promise<boolean> => {
    if (await checkDailyUsage(ctx.from?.id!)) {
        await ctx.replyWithAnimation(DAILY_LIMIT_REACHED_GIF, {
            caption: `Daily limit reached for @${ctx.from?.username}! Wait 24H or help me pay the bills lol. Also let your meat relax for a bit jesus christ.`,
        });
        return true;
    }
    return false;
};

/**
 * Send the loading animation to the chat
 * @param ctx : The context of the message
 * @returns The loading message
 */
const sendLoadingAnim = async (
    ctx: CommandContext<Context>
): Promise<Message.AnimationMessage> => {
    const { loading_messages, loading_gifs } = await getSettings();
    const randomGif =
        loading_gifs[Math.floor(Math.random() * loading_gifs.length)];
    const randomMessage =
        loading_messages[Math.floor(Math.random() * loading_messages.length)];
    return await bot.api.sendAnimation(ctx.chat.id, randomGif, {
        caption: randomMessage,
    });
};

/**
 * Sends the doujin to the chat
 * @param ctx : The context of the message
 * @param doujin : The doujin to be sent
 * @param loadingMessage : The loading message to be deleted
 */
const sendDoujin = async (
    ctx: CommandContext<Context>,
    doujin: Doujin,
    loadingMessage: Message.AnimationMessage
): Promise<void> => {
    const { max_files } = await getSettings();
    let inlineKeyboard;
    if (ctx.chat.type === 'private') {
        inlineKeyboard = new InlineKeyboard()
            .text('Post images', `post ${doujin.doujin_id}`)
            .text('Zip', `zip ${doujin.doujin_id}`)
            .row()
            .text('Dismiss', 'none');
    } else {
        inlineKeyboard = new InlineKeyboard();
    }
    if (doujin.file_count > max_files) {
        await ctx.reply(
            `This doujin has more files than the maximum allowed ${max_files}, only the first ${max_files} will be posted/uploaded`
        );
    }
    const message = doujinMessage(doujin);
    await bot.api.deleteMessage(
        loadingMessage.chat.id,
        loadingMessage.message_id
    );
    await ctx.reply(message, {
        reply_markup: inlineKeyboard,
        parse_mode: 'HTML',
    });
    await addDoujin(ctx.from?.id!, parseInt(doujin.doujin_id));
    await cleanupWorkdir();
};

bot.callbackQuery('mf', async (ctx) => {
    // change the max number of files
    ctx.answerCallbackQuery('Changing max files...');
    ctx.editMessageText('Reply to this message with the new max number of files.');
    
})
bot.callbackQuery('dl', async (ctx) => {
    // change the max number of files
    ctx.answerCallbackQuery('Changing daily limit...');
    ctx.editMessageText('Reply to this message with the new max daily limit.');
    
})
bot.callbackQuery('wl', async (ctx) => {
    // change the max number of files
    ctx.answerCallbackQuery('Changing whitelist...');
    ctx.editMessageText('Reply to this message with an new ID to whitelist or to remove from the whitelist (prefix with a + or a -).');
    
})

/** Handle the callback queries */
bot.on('callback_query:data', async (ctx) => {
    if (ctx.callbackQuery.data == 'none') {
        await ctx.answerCallbackQuery('Dismissing...');
        await ctx.editMessageReplyMarkup({});
    } else if (ctx.callbackQuery.data.includes('post')) {
        await ctx.answerCallbackQuery('Posting gallery...');
        const doujinId = ctx.callbackQuery.data.split(' ')[1];
        await postingGallery(ctx, doujinId);
        await ctx.editMessageReplyMarkup({});
    } else if (ctx.callbackQuery.data.includes('zip')) {
        await ctx.answerCallbackQuery('Posting zip file...');
        const doujinId = ctx.callbackQuery.data.split(' ')[1];
        await postingZip(ctx, doujinId);
        await ctx.editMessageReplyMarkup({});
    }
});

/**
 * Post the gallery to the chat
 * @param ctx : The context of the message
 * @param doujinId : The id of the doujin to be posted
 */
const postingGallery = async (
    ctx: Context,
    doujinId: string
): Promise<void> => {
    const doujin = (await getDoujin(doujinId)) as Doujin;
    const imageUrls = doujin.image_urls;
    const imageBatches = [];
    while (imageUrls.length > 0) {
        imageBatches.push(imageUrls.splice(0, 10));
    }
    while (imageBatches.length > 0) {
        try {
            await ctx.replyWithMediaGroup(
                imageBatches[0].map((url) => ({ type: 'photo', media: url }))
            );
            imageBatches.shift();
            // wait 3.5 seconds between batches to avoid 429 error (Hopefully)
            await new Promise((r) => setTimeout(r, 3500));
        } catch (error) {
            if (error instanceof GrammyError) {
                if (error.error_code == 429) {
                    createLog(
                        LOG_LEVELS_API.WARN,
                        '(BOT) 429 error, waiting 15 seconds'
                    );
                    console.log(
                        LOG_LEVELS.INFO,
                        '429 error, waiting 15 seconds'
                    );
                    await new Promise((r) => setTimeout(r, 10000));
                }
            }
        }
    }
};

/**
 * Post the zip file to the chat
 * @param ctx : The context of the message
 * @param doujinId the id of the doujin to be zipped
 */
const postingZip = async (ctx: Context, doujinId: string) => {
    const doujin = (await getDoujin(doujinId)) as Doujin;
    const zipfile = await zipDoujin(doujin);
    await ctx.replyWithDocument(new InputFile(zipfile));
    await cleanupWorkdir();
};

/** Error handler */
bot.catch(async (err) => {
    const ctx = err.ctx;
    console.error(
        LOG_LEVELS.ERROR,
        `Error while handling update ${ctx.update.update_id}: ${err}`
    );
    // deno-lint-ignore no-explicit-any
    const e: any = err.error;

    if (e instanceof BotError) {
        createLog(LOG_LEVELS_API.WARN, `(BOT) ${e.name}: ${e.message}`);
        await ctx.replyWithAnimation(ERROR_GIF, {
            caption:
                e.caption ||
                'Something went wrong! If this keeps happening please contact @trueimmortal',
        });
    } else {
        createLog(LOG_LEVELS_API.ERROR, `(BOT) ${err.name}: ${err.message}`);
        await ctx.replyWithAnimation(ERROR_GIF, {
            caption:
                'Something went wrong! If this keeps happening please contact @trueimmortal',
        });
    }
});
const handle = run(bot, {
    runner: {
        fetch: {
            allowed_updates: ['callback_query', 'message'],
        },
    },
});

Deno.addSignalListener('SIGINT', () => handle.stop());
Deno.addSignalListener('SIGTERM', () => handle.stop());

handle.task()?.then(() => console.log('Bot done running'));
