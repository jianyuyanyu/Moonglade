﻿import * as utils from '/js/app/utils.module.mjs'
import * as blogToast from '/js/app/blogtoast.module.mjs'
import { getPreferredTheme, setTheme } from '/js/app/theme.module.mjs'

window.emptyGuid = '00000000-0000-0000-0000-000000000000';
window.formatUtcTime = utils.formatUtcTime;

window.blogToast = blogToast;
window.getPreferredTheme = getPreferredTheme;

setTheme(getPreferredTheme());