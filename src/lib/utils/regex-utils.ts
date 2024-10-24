export class RegexUtils {
    public static regex(input: string): RegExp | undefined {
        if (!input) return undefined;
        
        const match = input.match(/^\/(.*)\/([^/]*)$/);
        if (!match) {
            return undefined;
        }

        try {
            return new RegExp(match[1], match[2]);
        } catch {
            return undefined;
        }
    }

    public static escapeRegex(input: string | undefined): string {
        return input?.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') ?? '';
    }

    public static discordId(input: string | undefined): string | undefined {
        if (!input) return undefined;
        return input.match(/\b\d{17,20}\b/)?.[0];
    }

    public static tag(input: string | undefined): { 
        username: string; 
        tag: string; 
        discriminator: string; 
    } | undefined {
        if (!input) return undefined;
        
        const match = input.match(/\b(.+)#([\d]{4})\b/);
        if (!match) {
            return undefined;
        }

        return {
            tag: match[0],
            username: match[1],
            discriminator: match[2],
        };
    }
}