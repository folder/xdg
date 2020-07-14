const path = require('path');
process.env.XDG_USER_DIRS = path.join(__dirname, 'user-dirs.dirs');
process.env.XDG_USER_DIRS_DEFAULTS = path.join(__dirname, 'user-dirs.defaults');
process.env.XDG_USER_DIRS_CONF = path.join(__dirname, 'user-dirs.conf');
