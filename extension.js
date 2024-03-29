const Main = imports.ui.main;
const GLib = imports.gi.GLib;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Format = Me.imports.format;

var lbl, signalHandlerID, last = "";

function clock_overrider(lbl) {
    var FORMAT = "%A, %d.%m.%Y - %H:%M:%S";
    var now = GLib.DateTime.new_now_local();

    var desired = Format.format(FORMAT, now);

    var t = lbl.get_text();
    if (t != desired) {
        last = t;
        lbl.set_text(desired);
    }
}

function lbl_exist() {
    var sA = Main.panel._statusArea;
    if (!sA) { sA = Main.panel.statusArea; }

    if (!sA || !sA.dateMenu || !sA.dateMenu.actor) {
        print("Looks like Shell has changed where things live again; aborting.");
        return false;
    }

    sA.dateMenu.actor.first_child.get_children().forEach(function(w) {
        // assume that the text label is the first StLabel we find.
        // This is dodgy behaviour but there's no reliable way to
        // work out which it is.
        if (w.get_text && !lbl) { lbl = w; }
    });
    if (!lbl) {
        print("Looks like Shell has changed where things live again; aborting.");
        return false;
    }
    signalHandlerID = lbl.connect("notify::text", clock_overrider);
    last = lbl.get_text();
    return true;
}

function enable() {
    if(lbl_exist()) {
        clock_overrider(lbl);
    }
    Main.panel.statusArea['activities'].container.hide();
    Main.panel.statusArea['appMenu'].container.hide();
}

function disable() {
    if (lbl && signalHandlerID) {
        lbl.disconnect(signalHandlerID);
        lbl.set_text(last);
    }
    Main.panel.statusArea['activities'].container.show();
    Main.panel.statusArea['appMenu'].container.show();
}
