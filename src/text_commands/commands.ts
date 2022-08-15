interface ITextCommand {
    name: string,
    help: string,
    extraHelp?: string,
    description: string,

    regex: RegExp,
    extraRegex?: RegExp[]

    rank?: number
}

// TODO: complain about typescript - why do I need to add ! to these, when they ARE definitely assigned, as they're required in the interface?
export class TextCommand {
    name!: string;
    help!: string;
    extraHelp?: string
    description!: string;

    regex!: RegExp;
    extraRegex?: RegExp[]

    rank: number = 0;

    constructor(obj: ITextCommand) {
        Object.assign(this, obj);
    }
    
}

const UNKNOWN_COMMAND = ["I didn't quite catch that, care to try again?\n", "I couldn't quite parse that, sorry.\n", "I don't know what you mean, sorry.\n"]
const UNIGNORE_SELF = "One, I'd like to interact with you!"
const UNIGNORE_CHANNEL = "One, unignore this channel!"
const commands = [
    new TextCommand({name: "printAuthor", help: "What are my stats?", description: "I will reply with info about you.",
        regex: /what\s+(?:do\s+)?you\s+know\s+about\s+me[,.?!\s]{0,3}\s*$|what\s+(?:are\s+)?my\s+stats[,.?!\s]{0,3}\s*$|what\s+(?:do\s+)?you\s+think\s+(?:of\s+)?me[,.?!\s]{0,3}\s*$/i}),

    new TextCommand({name: "ignoreAuthor", help: "Ignore me.", description: "I will stop interacting with you.",
        regex: /ignore\s+me[,.?!\s]{0,3}\s*$|don'?t\s+(?:talk|react|respond)\s+to\s+me(?:\s+or\s+my\s+(?:son|daughter))?(?:\s+ever(?:\s+again))?[,.?!\s]{0,3}\s*$/i}),

    new TextCommand({name: "setAuthorAnyEnum", help: "'Set my reaction type to 4.' or 'Set my error type to 2.'", description: "Set the option for reactions, valid commands or errors.",
        regex: /set\s+my\s+(?:(react(?:ion)?)|(parse|(?:valid\s+)commands?)|(errors?(?:\s+response)?))\s*type\s+(?:to\s+)?(\d+)[,.?!\s]{0,3}\s*$/i}),
        
    new TextCommand({name: "setAuthorReactChance", help: "Set my reaction chance to 50%.", description: "The chance that I will react to you.",
        regex: /set\s+my\s+react(?:ion)?\s*chance\s+(?:to\s+)?(-?\d*.?\d*%?)[,.?!\s]{0,3}\s*$/i}),

    new TextCommand({name: "setAuthorReactEmote", help: "Set my reaction emote to 944199066911395840!", description: "Set what emote I will react to your messages with when you mention me.",
        regex: /(re)?set\s+my\s+(?:custom\s+)?react(?:ion)?\s+emote(?:\s+to)?(\s+[^,.?!\s]+)?[,.?!\s]{0,3}\s*$/i}),

    new TextCommand({name: "setAnyAny", help: "SetAny @Two rank 10", description: "Set almost any property for some user (surrounded by # on each side).\nExceptions: No setting for the bot owner or setting spicy database columns,",
        regex: /setAny\s+(.+)\s+([a-zA-z][a-zA-z0-9]*)\s+(?:([a-zA-z0-9]+)|("[^"]*"))\s*/i, rank: 10}),

    new TextCommand({name: "ignoreChannel", help: "'Ignore this channel.', or 'Unignore channel 1111111111111.'", description: "I will ignore (or not) all messages in a certain channel.", 
        regex: /(un)?ignore\s+(?:(this\s+)?channel|channel\s+(\d+)|channel\s+([a-zA-Z_\-]+))[,.?!\s]{0,3}\s*$/i, rank: 10}),

    new TextCommand({name: "listCommands", help: "'Help!' or 'What are the commands, page 3?'", description: "I will list available text-based commands.",
        regex: /(?:what\s+(?:are\s+)?(?:the\s+)?commands|what\s+(?:can\s+)?you\s+do|help|list(?:\s+the)?(?:\s+commands?)?)(?:,?\s+page\s+(\d+))?[,.?!\s]{0,3}\s*$/i}),

    new TextCommand({name: "infoCommand", help: "'Help for renderSnap!' or 'Info about renderSnap!'", description: "I will tell you info about a specific text-based command.",
        regex: /(?:help|info)(?:\s+about|\s+for)?\s+(?:command\s+)?(\w+)[,.?!\s]{0,3}\s*$/i}),

    new TextCommand({name: "listAnyEnum", help: "'List the reaction types.' or 'List chocies for valid command messages.`", description: "I will list available options for reacting, valid commands or errors.",
        regex: /(?:(?:what\s+(?:are\s+)?|list\s+)(?:(?:choices|variants|options)\s+for)?(?:the\s+)?|how\s+can\s+you)(?:(react(?:ion)?s?\s*(?:types?)?)|((?:pars(?:es?|ing)(?:\s*types?)?)|(?:valid\s+)?(?:commands?|messages?))|(error(?:\s*types?|\s+responses?)?))[,.?!\s]{0,3}\s*$/i
    }),
    
    new TextCommand({name: "IMShower", help: "Shower!", description: "\\*showering\\*",
        regex: /shower[,.?!\s]{0,3}\s*$/i}),

    new TextCommand({name: "IMDance", help: "Dance!", description: "\\*dancing\\*",
        regex: /dance[,.?!\s]{0,3}\s*$/i}),

    new TextCommand({name: "IMHello", help: "'Hello!' or 'Goodbye!'", description: "\\*waving\\*",
        regex: /(?:wave\s+)?(?:hello|(?:good\s*)?(?:morning|bye|night)(?:\s+to(?:.*))?|see\s+y(?:a|ou)(?:\s+later)?\s*)[,.?!\s]{0,3}\s*$/i}),
    
    new TextCommand({name: "exceptionTest", help: "Test your exception handling!", description: "I will cause an exception while executing a command.",
        regex: /test\s+(?:(?:your)|(?:the))?\s+exception\s+handling[.?!\s]{0,3}\s*$|\s+try\s+to\s+die\s+while\s+running\s+a?\s+command[,.?!\s]{0,3}\s*$/i}),
    
    new TextCommand({name: "renderMonkeys", help: "Do a test render of this: https://only.one.com/one.png", description: "I will do a test render with that image.",
        regex: /(?:do\s+a\s+)?test\s+render(?:\s+of)?(?:\s+((?:[,.?!\s]?[^,.?!\s]+)+))?[,.?!\s]{0,3}\s*$/i}),
    
    new TextCommand({name: "renderSnap", help: "Snap this out of existence: https://only.one.com/zero.png", description: "I will snap that image or video out of existence.",
        regex: /(Thanos\s+)?snap(?:\s+((?:[,.?!\s]?[^,.?!\s]+)+))?[,.?!\s]{0,3}\s*$/i,
        extraRegex: [
            /rotated\s+(-?(?:\d+|\d*\.\d*))(r|rad|radians)?(?:d|deg|degrees)?/i,
            /(?:using|shaped?(?:\s+like)?)\s+(\w+)/i,
            /(?:min\s+|minimum\s+)?distance\s+(-?(?:\d+|\d*\.\d*))/i,
            /size\s+(-?(?:\d+|\d*\.\d*))/i,
            /(?:bgcolor|background(?:\s*color)?)\s+#?([A-Fa-f0-9]{6})/i
        ],
        extraHelp: "Optional parameters are:\nShape - Circle, Hexagon, Octagon, One, Tile, Triangle\nMinimum distance (between each particle) - [1.0, 25.0]\nSize (of each particle) - [0.1, 20.0]\nBackground color - hexadecimal color\nLong example:\nOne, snap this rotated 3.14rad shaped like Hexagon with distance 4.0 and size 0.3 and background color #FF0000: https://only.one.com/zero.png"
    }),

    new TextCommand({name: "renderBarrel", help: "Do a barrel roll using me!", description: "I'll roll the specifid person as a barrel.",
        regex: /(?:do\s+(?:a\s+)?)?barrel\s+roll(?:\s+(?:using|with)?)?(?:\s+((?:[,.?!\s]?[^,.?!\s]+)+))?[,.?!\s]{0,3}\s*$/i}),

    new TextCommand({name: "renderWelcome", help: "Welcome using utahimeWelcome2 and text '@Lovely Bot' @OnlyOne", description: "I'll make a welcome picture for the specified person(/image) with the specified scene (or a random scene) and text.",
        regex: /welcome\s+(?:using\s+([a-zA-Z0-9]+)\s+)?(?:(?:and\s+)?(?:text\s+)?'([^']+)'\s+|(?:and\s+)?(without\s+text))?(.*)/i}),

    new TextCommand({"name": "calculate", "help": "'Calculate 1+1 - 1', or 'Calculate using RPN 1 1 1 + -'", "description": "I will calculate your expression - please don't use punctuation!",
        regex: /calculate\s+((?:(?:using|with)\s+|with\s+)?(?:reverse\s+polish(?:\s+notation)|RPN)\s+)?(.+)$/i,
        extraHelp: "Subtraction should have spaces around it! To write a negative number, make the - a part of the number (e.g. -2 and not - 2).\nSupported operators are:\n+ - * / ^ | || & && % mod log sin cos tan cotan\nabs floor ceil fract round (rounds up) ~ (boolean negation, aka not)\nkg g t lb\nm cm dm km mile ft yd in\nrad deg\nc f\ns ms min h day month year decade century\nl ml\nb B kb kB kib kiB and other byte units, up to and including tera\nuntype\nUnit unary operators will assign a kind of unit to your value, and attempt to convert to other kinds you specify.\nIf they're mismatched types, e.g. seconds (time) then celsius (heat), the type will simply be overridden preserving the value.\nKnowing this, use 'untype' to directly change the type of convertible units without converting."
    }),

    new TextCommand({name: "updateCurrencies", help: "Update currency conversion rates.", description: "I will update my currency conversion rates if enough time has passed.",
        regex: /update\s+(?:your\s+)?(?:currency\s+)?(?:conversion\s+|exchange\s+)?rates[,.?!\s]{0,3}\s*$/i}),

    new TextCommand({name: "respondHowAreYou", help: "How are you?", description: "I will tell you how I'm feeling.",
        regex: /how\s*(?:are|'?re)\s+you[,.?!\s]{0,3}\s*$/i}),

    new TextCommand({name: "respondHowIs", help: "How's Two doing?", description: "I will tell you how someone or something is.",
        regex: /how\s*(?:'?s|is) (.*)$/i}),

    new TextCommand({name: "respondIm", help: "I'm glad to be with you.", description: "I will note your feelings.",
        regex: /I\s*(?:am|'?m) (.*)$/i}),

    new TextCommand({name: "respondYoure", help: "You're so nice to be around.", description: "Compliment me. Preferably.",
        regex: /you\s*(?:are|'?re) (.*)$/i}),

    new TextCommand({name: "respondWhatIs", help: "What's that thing over there?", description: "Ask me a 'what-is' question.",
        regex: /what\s*(are|'?re|is|'?s) (.*)$/i}),

    new TextCommand({name: "respondWhoIs", help: "Who's the best intoner?", description: "Ask me a 'who-is' question.",
        regex: /who\s*(are|'?re|is|'?s) (.*)$/i}),

    new TextCommand({name: "searchFandom", help: "Wiki search toaru Index", description: "I will link you the first article from the first wikia I find, if I don't get CAPTCHA'd. Don't end with punctuation.",
        regex: /(?:wikia?|fandom)\s+(?:search\s+)([a-zA-Z0-9_]+)\s+(.+)/i}),

    new TextCommand({name: "searchUncyclopediaRandom", help: "Random uncyclopedia page!", description: "I will link you a random uncyclopedia article.",
        regex: /random\s+uncyclopedia(?:\s+(?:page|article))?[,.?!\s]{0,3}\s*$/i})
]

export { UNKNOWN_COMMAND, UNIGNORE_SELF, UNIGNORE_CHANNEL, commands };