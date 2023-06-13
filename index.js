const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('./config.json');
const client = new Client({
  intents: [Object.keys(GatewayIntentBits)],
  partials: [Object.keys(Partials)]
});
const fs = require('fs');
const botOwnerId = 'beatkapo'; // Reemplaza con tu ID de usuario
const requiredRole = 'Propietario'; // Reemplaza con el nombre del rol requerido
const workerRanks = ['Ayudante', 'Mozo', 'Guardia', 'Ranchero']; // Reemplaza con los rangos de trabajador en orden ascendente

client.on('ready', () => {
  console.log(`Conectado como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {

  if (message.content.startsWith('/contratar')) {
    // Verificar si el autor del mensaje es el propietario del bot o tiene el rol requerido
    if (!message.member.roles.cache.some((role) => role.name === requiredRole)) {
      return message.reply('No tienes los permisos necesarios para usar este comando.');
    }

    // Obtener la mención del usuario a contratar
    const userToContract = message.mentions.users.first();
    if (!userToContract) {
      return message.reply('Debes mencionar a un usuario válido.');
    }
    // const mentionedRoles = userToContract.roles.cache.map(role => role.name);

    // const hasAllowedRole = workerRanks.some(role => mentionedRoles.includes(role));

    // if (hasAllowedRole) {
    //   message.reply(`El usuario ya forma parte de la plantilla.`);
    // } 

    try {
      // Obtener el rol que deseas asignar al usuario
      const roleToAssign = message.guild.roles.cache.find((role) => role.name === workerRanks[0]);
      if (!roleToAssign) {
        return message.reply('No se pudo encontrar el rol especificado.');
      }

      // Asignar el rol al usuario
      await message.guild.members.cache.get(userToContract.id).roles.add(roleToAssign);

      // Enviar un mensaje privado al usuario contratado
      const contratacionMessage = fs.readFileSync('contratacion.txt', 'utf8');
      await userToContract.send(contratacionMessage);


      // Responder en el canal de texto indicando que se ha contratado al usuario
      message.channel.send(`Se ha contratado a ${message.guild.members.cache.get(userToContract.id).displayName}.`);
    } catch (error) {
      console.error('Error al contratar al usuario:', error);
      message.reply('Ocurrió un error al intentar contratar al usuario.');
    }
  }

  if (message.content.startsWith('/ascender')) {
    // Verificar si el autor del mensaje es el propietario del bot o tiene el rol requerido
    if (message.author.id !== botOwnerId && !message.member.roles.cache.some((role) => role.name === requiredRole)) {
      return message.reply('No tienes los permisos necesarios para usar este comando.');
    }

    // Obtener la mención del usuario a ascender
    const userToPromote = message.mentions.users.first();
    if (!userToPromote) {
      return message.reply('Debes mencionar a un usuario válido para ascenderlo.');
    }

    try {
      // Obtener el rol actual del usuario
      const userMember = message.guild.members.cache.get(userToPromote.id);
      const currentRoles = userMember.roles.cache;
      const currentRank = workerRanks.find(rank => currentRoles.some(role => role.name === rank));

      if (!currentRank) {
        return message.reply('El usuario no tiene un rango de trabajador válido.');
      }

      // Obtener el siguiente rango de trabajador
      const nextRankIndex = workerRanks.indexOf(currentRank) + 1;
      if (nextRankIndex >= workerRanks.length) {
        return message.reply('No se puede ascender más al usuario, ya tiene el rango máximo."');
      }
      const nextRank = workerRanks[nextRankIndex];

      // Obtener el rol correspondiente al siguiente rango
      const nextRankRole = message.guild.roles.cache.find(role => role.name === nextRank);
      if (!nextRankRole) {
        return message.reply('No se pudo encontrar el rol correspondiente al siguiente rango.');

      }

      // Remover el rol actual y asignar el rol del siguiente rango al usuario
      await userMember.roles.remove(currentRoles);
      await userMember.roles.add(nextRankRole);
      const archivoTexto = `${nextRank.toLowerCase()}.txt`;

      // Leer el contenido del archivo de texto correspondiente
      const contenidoTexto = fs.readFileSync(archivoTexto, 'utf8');

      // Construir el mensaje para el usuario ascendido
      const mensajeAscenso = `¡Felicitaciones! Has sido ascendido a ${contenidoTexto}`;
      userMember.send(mensajeAscenso);
      // Responder en el canal de texto indicando el ascenso del usuario
      message.channel.send(`Se ha ascendido a ${message.guild.members.cache.get(userToPromote.id).displayName} al rango ${nextRank}.`);

    } catch (error) {
      console.error('Error al ascender al usuario:', error);
      message.reply('Ocurrió un error al intentar ascencder al usuario.');
    }
  }
  if (message.content.startsWith('/descender')) {
    // Verificar si el autor del mensaje es el propietario del bot o tiene el rol requerido
    if (message.author.id !== botOwnerId && !message.member.roles.cache.some((role) => role.name === requiredRole)) {
      return message.reply('No tienes los permisos necesarios para usar este comando.');
    }

    // Obtener la mención del usuario a ascender
    const userToPromote = message.mentions.users.first();
    if (!userToPromote) {
      return message.reply('Debes mencionar a un usuario válido para ascenderlo.');
    }

    try {
      // Obtener el rol actual del usuario
      const userMember = message.guild.members.cache.get(userToPromote.id);
      const currentRoles = userMember.roles.cache;
      const currentRank = workerRanks.find(rank => currentRoles.some(role => role.name === rank));

      if (!currentRank) {
        return message.reply('El usuario no tiene un rango de trabajador válido.');
      }

      // Obtener el siguiente rango de trabajador
      const prevRankIndex = workerRanks.indexOf(currentRank) - 1;
      if (prevRankIndex < 0) {
        return message.reply('No se puede descender más al usuario, prueba con "/despedir @usuario razón"');
      }
      const prevRank = workerRanks[prevRankIndex];
      const archivoTexto = `${prevRank.toLowerCase()}.txt`;

      // Leer el contenido del archivo de texto correspondiente
      const contenidoTexto = fs.readFileSync(archivoTexto, 'utf8');

      // Construir el mensaje para el usuario ascendido
      const mensajeAscenso = `Vaya, no se que habrás hecho pero has sido descendido a ${contenidoTexto}`;
      userMember.send(mensajeAscenso);

      // Obtener el rol correspondiente al siguiente rango
      const prevRankRole = message.guild.roles.cache.find(role => role.name === prevRank);
      if (!prevRankRole) {
        return message.reply('No se pudo encontrar el rol correspondiente al siguiente rango.');

      }

      // Remover el rol actual y asignar el rol del siguiente rango al usuario
      await userMember.roles.remove(currentRoles);
      await userMember.roles.add(prevRankRole);

      // Responder en el canal de texto indicando el ascenso del usuario
      message.channel.send(`Se ha descendido a ${message.guild.members.cache.get(userToPromote.id).displayName} al rango ${prevRank}.`);
    } catch (error) {
      console.error('Error al descender al usuario:', error);
      message.reply('Ocurrió un error al intentar descender al usuario.');
    }
  }
  if (message.content.startsWith('/despedir')) {
    // Verificar si el autor del mensaje es el propietario del bot o tiene el rol requerido
    if (message.author.id !== botOwnerId && !message.member.roles.cache.some((role) => role.name === requiredRole)) {
      return message.reply('No tienes los permisos necesarios para usar este comando.');
    }

    // Obtener la mención del usuario a despedir
    const mentionedUser = message.mentions.users.first();
    if (!mentionedUser) {
      return message.reply('Debes mencionar a un usuario válido para despedirlo.');
    }

    // Obtener la razón del despido
    const reason = message.content.split(' ').slice(2).join(' ');
    if (!reason) {
      return message.reply('Debes proporcionar una razón para el despido.');
    }

    try {
      // Obtener el rol actual del usuario
      const userMember = message.guild.members.cache.get(mentionedUser.id);
      const currentRoles = userMember.roles.cache;

      // Verificar si el usuario tiene uno de los rangos de trabajador
      const currentRank = workerRanks.find(rank => currentRoles.some(role => role.name === rank));
      if (!currentRank) {
        return message.reply('El usuario no tiene un rango de trabajador válido.');
      }

      // Quitar todos los roles de trabajador al usuario
      await userMember.roles.remove(currentRoles);

      // Leer la razón del despido desde el comando
      const reason = message.content.split(' ').slice(2).join(' ');
      if (!reason) {
        return message.reply('Debes proporcionar una razón para el despido.');
      }

      // Obtener el nombre del superior que envía el comando
      const superior = message.member.displayName;

      // Obtener el contenido del archivo despido.txt
      const despidoContent = fs.readFileSync('despido.txt', 'utf8');

      // Construir el mensaje de despido con la información proporcionada
      const mensajeDespido = `${superior} te ha despedido.\nRazón: ${reason}\n\n${despidoContent}`;

      // Enviar un mensaje privado al usuario despedido con el mensaje completo
      await mentionedUser.send(mensajeDespido);

      // Responder en el canal de texto indicando que se ha despedido al usuario
      message.channel.send(`Se ha despedido a ${message.guild.members.cache.get(mentionedUser.id).displayName}. Razón: ${reason}`);
    } catch (error) {
      console.error('Error al despedir al usuario:', error);
      message.reply('Ocurrió un error al intentar despedir al usuario.');
    }
  }
  if (message.author.id !== client.user.id) {
    if (message.author.bot) return; // Verifica si el autor del mensaje es un bot

    message.delete();
  }
});

client.login(config.token);