import { Precondition, Result, UserError } from '@sapphire/framework';
import { ChatInputCommandInteraction, Message } from 'discord.js';

export class UserPrecondition extends Precondition {
    public override async chatInputRun(interaction: ChatInputCommandInteraction) {
      const isRegistered = await this.checkRegistration(interaction.user.id);
      
      if (!isRegistered) {
        await interaction.reply({
          content: "You need to register an account before trading! Use `/register` to get started.",
          ephemeral: true
        });
        
        return Result.err(new UserError({ identifier: 'UserNotRegistered', message: 'User is not registered' }));
      }
      
      return Result.ok();
    }
  
    private async checkRegistration(userId: string): Promise<boolean> {
      // Replace this with your actual database check
      return false; // Temporary return false for testing
    }
  }
  
  declare module '@sapphire/framework' {
    interface Preconditions {
      registered: never;
    }
  }