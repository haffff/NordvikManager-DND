        for (var a in ((r = {}), n)) a !== `key` && (r[a] = n[a]);
      else r = n;
      return (
        (n = r.ref),
        { $$typeof: t, type: e, key: i, ref: n === void 0 ? null : n, props: r }
      );
    }
    ((e.Fragment = n), (e.jsx = r), (e.jsxs = r));
  }),
  b = o((e, t) => {
    t.exports = y();
  })(),
  x = ({
    attribute: e,
    initAttribute: t,
    initModifier: n,
    Api: r,
    icon: i,
  }) => {
    let [a, o] = _.useState(0),
      [s, c] = _.useState(0),
      [l, u] = _.useState(0),
      d = `${e}_attribute`,
      f = `${e}_mod`;
    return (
      _.useEffect(() => {
        let e = ({ value: e }) => {
          (o(e), u(e));
          let t = Math.floor((Number(e) - 10) / 2);
          (c(t),
            r.Properties.Get(f).then((e) => {
              (!e || e.value != t) && r.Properties.Set(f, t);
            }));
        };
        return (
          (async () => {
            (r.Properties.Subscribe(d, e),
              await r.Properties.Init(d, t ?? 10),
              await r.Properties.Init(f, n ?? 0));
            let i = await r.Properties.Get(d),
              a = await r.Properties.Get(f),
              s = Math.floor((Number(i.value) - 10) / 2);
            (a.value != s && (await r.Properties.Set(f, s)),
              c(s),
              o(i.value),
              u(i.value));
          })(),
          () => {
            r.Properties.Unsubscribe(d, e);
          }
        );
      }, []),
      (0, b.jsxs)(`div`, {
        className: `dnd5e_attribute`,
        children: [
          (0, b.jsx)(`div`, {
            className: `dnd5e_attribute_name`,
            onClick: () => {
              r.FireAction(`dnd5e/roll_attribute`, { attribute: e });
            },
            children: e,
          }),
          (0, b.jsx)(`input`, {
            className: `dnd5e_attribute_value`,
            type: `text`,
            value: l ?? ``,
            onChange: (e) => {
              isNaN(e.target.value) || u(e.target.value);
            },
            onBlur: () => {
              if (isNaN(l) || l === ``) {
                u(a);
                return;
              }
              (o(parseInt(l)), r.Properties.Set(d, parseInt(l)));
            },
          }),
          (0, b.jsx)(`div`, {
            className: `dnd5e_attribute_modifier`,
            children: s >= 0 ? `+${s}` : s,
          }),
        ],
      })
    );
  },
  S = {
    color: void 0,
    size: void 0,
    className: void 0,
    style: void 0,
    attr: void 0,
  },
  C = _.createContext && _.createContext(S),
  w = [`attr`, `size`, `title`];
function ee(e, t) {
  if (e == null) return {};
  var n,
    r,
    i = te(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (r = 0; r < a.length; r++)
      ((n = a[r]),
        t.indexOf(n) === -1 &&
          {}.propertyIsEnumerable.call(e, n) &&
          (i[n] = e[n]));
  }
  return i;
}
function te(e, t) {
  if (e == null) return {};
  var n = {};
  for (var r in e)
    if ({}.hasOwnProperty.call(e, r)) {
      if (t.indexOf(r) !== -1) continue;
      n[r] = e[r];
    }
  return n;
}
function T() {
  return (
    (T = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    T.apply(null, arguments)
  );
}
function E(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    (t &&
      (r = r.filter(function (t) {
        return Object.getOwnPropertyDescriptor(e, t).enumerable;
      })),
      n.push.apply(n, r));
  }
  return n;
}
function ne(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] == null ? {} : arguments[t];
    t % 2
      ? E(Object(n), !0).forEach(function (t) {
          re(e, t, n[t]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
        : E(Object(n)).forEach(function (t) {
            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
          });
  }
  return e;
}
function re(e, t, n) {
  return (
    (t = ie(t)) in e
      ? Object.defineProperty(e, t, {
          value: n,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (e[t] = n),
    e
  );
}
function ie(e) {
  var t = ae(e, `string`);
  return typeof t == `symbol` ? t : t + ``;
}
function ae(e, t) {
  if (typeof e != `object` || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t || `default`);
    if (typeof r != `object`) return r;
    throw TypeError(`@@toPrimitive must return a primitive value.`);
  }
  return (t === `string` ? String : Number)(e);
}
function oe(e) {
  return (
    e &&
    e.map((e, t) => _.createElement(e.tag, ne({ key: t }, e.attr), oe(e.child)))
  );
}
function se(e) {
  return (t) =>
    _.createElement(ce, T({ attr: ne({}, e.attr) }, t), oe(e.child));
}
function ce(e) {
  var t = (t) => {
    var { attr: n, size: r, title: i } = e,
      a = ee(e, w),
      o = r || t.size || `1em`,
      s;
    return (
      t.className && (s = t.className),
      e.className && (s = (s ? s + ` ` : ``) + e.className),
      _.createElement(
        `svg`,
        T(
          { stroke: `currentColor`, fill: `currentColor`, strokeWidth: `0` },
          t.attr,
          n,
          a,
          {
            className: s,
            style: ne(ne({ color: e.color || t.color }, t.style), e.style),
            height: o,
            width: o,
            xmlns: `http://www.w3.org/2000/svg`,
          },
        ),
        i && _.createElement(`title`, null, i),
        e.children,
      )
    );
  };
  return C === void 0 ? t(S) : _.createElement(C.Consumer, null, (e) => t(e));
}
var D = {
    attributes: [
      { attribute: `strength`, initAttribute: 10, initModifier: 0 },
      { attribute: `dexterity`, initAttribute: 10, initModifier: 0 },
      { attribute: `constitution`, initAttribute: 10, initModifier: 0 },
      { attribute: `intelligence`, initAttribute: 10, initModifier: 0 },
      { attribute: `wisdom`, initAttribute: 10, initModifier: 0 },
      { attribute: `charisma`, initAttribute: 10, initModifier: 0 },
    ],
    skills: [
      { name: `Acrobatics`, modifier: `dexterity` },
      { name: `Animal Handling`, modifier: `wisdom` },
      { name: `Arcana`, modifier: `intelligence` },
      { name: `Athletics`, modifier: `strength` },
      { name: `Deception`, modifier: `charisma` },
      { name: `History`, modifier: `intelligence` },
      { name: `Insight`, modifier: `wisdom` },
      { name: `Intimidation`, modifier: `charisma` },
      { name: `Investigation`, modifier: `intelligence` },
      { name: `Medicine`, modifier: `wisdom` },
      { name: `Nature`, modifier: `intelligence` },
      { name: `Perception`, modifier: `wisdom` },
      { name: `Performance`, modifier: `charisma` },
      { name: `Persuasion`, modifier: `charisma` },
      { name: `Religion`, modifier: `intelligence` },
      { name: `Sleight of Hand`, modifier: `dexterity` },
      { name: `Stealth`, modifier: `dexterity` },
      { name: `Survival`, modifier: `wisdom` },
    ],
    spellSources: [],
  },
  O = ({ attributesList: e, Api: t }) =>
    (0, b.jsxs)(`div`, {
      className: `dnd5e_attribute_container`,
      children: [
        (0, b.jsx)(`div`, {
          className: `dnd-panel-title`,
          style: { width: `100%`, textAlign: `center` },
          children: `Ability Scores`,
        }),
        e.map((e) =>
          (0, b.jsx)(
            x,
            {
              attribute: e.attribute,
              initAttribute: e.initAttribute,
              initModifier: e.initModifier,
              Api: t,
              icon: e.icon,
            },
            e.attribute,
          ),
        ),
      ],
    }),
  k = ([e, t, n]) => {
    let [r, i] = _.useState(void 0);
    return (
      _.useEffect(() => {
        let r = ({ value: e }) => {
          i(e);
        };
        return (
          (async () => {
            (e.Properties.Subscribe(t, r), await e.Properties.Init(t, n));
            let a = await e.Properties.Get(t);
            a && i(a.value);
          })(),
          () => {
            e.Properties.Unsubscribe(t, r);
          }
        );
      }, [t]),
      [
        r,
        (n) => {
          e.Properties.Set(t, n);
        },
      ]
    );
  },
  le = ({ Api: e }) => {
    let [t, n] = k([e, `character_name`, ``]),
      [r, i] = _.useState(t ?? ``);
    return (
      _.useEffect(() => {
        i(t ?? ``);
      }, [t]),
      (0, b.jsxs)(`div`, {
        className: `dnd5e_characterName_container`,
        children: [
          (0, b.jsx)(`input`, {
            className: `dnd5e_text_value`,
            type: `text`,
            value: r,
            onChange: (e) => i(e.target.value),
            onBlur: () => {
              r !== (t ?? ``) && n(r);
            },
          }),
          (0, b.jsx)(`div`, {
            className: `dnd5e_text_name`,
            children: `Character Name`,
          }),
        ],
      })
    );
  },
  ue = ({ label: e, value: t, setValue: n, style: r, inputStyle: i }) => {
    let [a, o] = _.useState(t ?? ``);
    return (
      _.useEffect(() => {
        o(t ?? ``);
      }, [t]),
      (0, b.jsxs)(`div`, {
        className: `dnd5e_characterInfo_container`,
        style: r,
        children: [
          (0, b.jsx)(`input`, {
            className: `dnd5e_text_value`,
            type: `text`,
            style: i,
            value: a,
            onChange: (e) => o(e.target.value),
            onBlur: () => {
              a !== (t ?? ``) && n(a);
            },
          }),
          (0, b.jsx)(`div`, { className: `dnd5e_text_name`, children: e }),
        ],
      })
    );
  },
  de = ({ Api: e }) => {
    let [t, n] = k([e, `character_class`, ``]),
      [r, i] = k([e, `character_level`, ``]),
      [a, o] = k([e, `character_background`, ``]),
      [s, c] = k([e, `character_race`, ``]),
      [l, u] = k([e, `character_alignment`, ``]),
      [d, f] = k([e, `character_experience_points`, ``]),
      [p, m] = k([e, `player_name`, ``]);
    return (0, b.jsxs)(`div`, {
      className: `dnd5e_characterInfo_main_container`,
      children: [
        (0, b.jsx)(`div`, {
          className: `dnd-panel-title`,
          children: `Character Info`,
        }),
        (0, b.jsxs)(`div`, {
          style: { display: `flex`, flexWrap: `wrap` },
          children: [
            (0, b.jsx)(ue, {
              label: `Class`,
              value: t,
              setValue: n,
              style: { width: `140px` },
              inputStyle: { width: `140px` },
            }),
            (0, b.jsx)(ue, {
              label: `Level`,
              value: r,
              setValue: i,
              style: { width: `50px` },
              inputStyle: { width: `50px` },
            }),
            (0, b.jsx)(ue, { label: `Background`, value: a, setValue: o }),
            (0, b.jsx)(ue, { label: `Player Name`, value: p, setValue: m }),
          ],
        }),
        (0, b.jsxs)(`div`, {
          style: { display: `flex`, flexWrap: `wrap` },
          children: [
            (0, b.jsx)(ue, { label: `Race`, value: s, setValue: c }),
            (0, b.jsx)(ue, { label: `Alignment`, value: l, setValue: u }),
            (0, b.jsx)(ue, {
              label: `Experience Points`,
              value: d,
              setValue: f,
            }),
          ],
        }),
      ],
    });
  },
  A = ({ name: e, Api: t, modifier: n, onCalculation: r, onNameClick: i }) => {
    let [a, o] = k([t, e, 0]),
      [s, c] = k([t, e + `_proficiency`, !1]),
      [l] = k([t, n, 0]),
      [u] = k([t, `proficiency_bonus`, 0]),
      d = s === !0 || (typeof s == `string` && s.toLowerCase() === `true`);
    return (
      _.useEffect(() => {
        if (l === void 0 || u === void 0) return;
        let t = d ? parseInt(l) + parseInt(u) : parseInt(l);
        (r && r(e, t), Number(a) !== t && o(t));
      }, [u, s, l]),
      (0, b.jsxs)(`div`, {
        className: `dnd5e_listItem`,
        children: [
          (0, b.jsx)(`div`, {
            className: `dnd5e_listItem_prof`,
            children: (0, b.jsx)(`input`, {
              type: `checkbox`,
              checked: d,
              onChange: (e) => c(e.target.checked),
            }),
          }),
          (0, b.jsx)(`div`, {
            className: `dnd5e_listItem_value`,
            children: a >= 0 ? `+${a}` : a,
          }),
          (0, b.jsx)(`div`, {
            className: `dnd5e_listItem_name`,
            onClick: () => {
              i && i(e);
            },
            children: e.split(`_`).join(` `),
          }),
        ],
      })
    );
  },
  j = ({ Api: e, attributesList: t }) =>
    (0, b.jsxs)(`div`, {
      className: `dnd5e_saving_throws_container`,
      children: [
        (0, b.jsx)(`div`, {
          className: `dnd-panel-title`,
          children: `Saving Throws`,
        }),
        t.map((t) =>
          (0, b.jsx)(A, {
            Api: e,
            name: t.attribute + `_save`,
            modifier: t.attribute + `_mod`,
            onNameClick: () => {
              e.FireAction(`dnd5e/roll_saving_throw`, {
                attribute: t.attribute,
              });
            },
          }),
        ),
      ],
    }),
  fe = ({ Api: e }) => {
    let [t, n] = k([e, `proficiency_bonus`, 0]),
      [r] = k([e, `character_level`, 1]);
    return (
      _.useEffect(() => {
        if (r) {
          let e = Math.floor((parseInt(r) - 1) / 4) + 2;
          Number(t) !== e && n(e);
        }
      }, [r]),
      (0, b.jsxs)(`div`, {
        className: `dnd5e_attribute`,
        style: { justifyContent: `center`, alignItems: `center` },
        children: [
          (0, b.jsx)(`div`, {
            className: `dnd5e_attribute_name`,
            children: `Prof. Bonus`,
          }),
          (0, b.jsxs)(`div`, {
            className: `dnd5e_attribute_value`,
            style: { lineHeight: `1.1`, padding: `4px 0` },
            children: [`+`, t],
          }),
        ],
      })
    );
  },
  pe = ({ Api: e, skills: t }) =>
    (0, b.jsxs)(`div`, {
      className: `dnd5e_saving_throws_container`,
      children: [
        (0, b.jsx)(`div`, { className: `dnd-panel-title`, children: `Skills` }),
        t.map((t) =>
          (0, b.jsx)(A, {
            Api: e,
            name: t.name,
            modifier: t.modifier + `_mod`,
            onNameClick: () => {
              e.FireAction(`dnd5e/roll_skill`, { skill: t.name });
            },
          }),
        ),
      ],
    }),
  me = ({
    propertyName: e,
    label: t,
    Api: n,
    customclass: r,
    readonly: i,
    rollLabel: a,
    rollOnClick: o,
  }) => {
    let [s, c] = k([n, e, 0]),
      [l, u] = _.useState(0);
    return (
      _.useEffect(() => {
        u(s);
      }, [s]),
      (0, b.jsxs)(`div`, {
        className: r || `dnd5e_attribute`,
        style: { justifyContent: `center`, alignItems: `center` },
        children: [
          (0, b.jsx)(`div`, { className: `dnd5e_attribute_name`, children: t }),
          (0, b.jsx)(`input`, {
            className: `dnd5e_attribute_value`,
            type: `text`,
            value: l ?? ``,
            onChange: (e) => {
              isNaN(e.target.value) || u(e.target.value);
            },
            onBlur: () => {
              if (isNaN(l) || l === ``) {
                u(s);
                return;
              }
              c(parseInt(l));
            },
          }),
          a &&
            o &&
            (0, b.jsx)(`div`, {
              onClick: o,
              className: `dnd5e_listItem_name`,
              style: { textAlign: `center` },
              children: a,
            }),
        ],
      })
    );
  },
  he = ({ Api: e }) => {
    let [t, n] = k([e, `hitdicemax`, 0]),
      [r] = k([e, `character_level`, 1]);
    return (
      _.useEffect(() => {
        if (r) {
          let e = parseInt(r);
          Number(t) !== e && n(e);
        }
      }, [r]),
      (0, b.jsxs)(`div`, {
        className: `dnb5e_hppanel`,
        children: [
          (0, b.jsxs)(`div`, {
            className: `dnd5e_health_bar`,
            children: [
              (0, b.jsx)(`div`, {
                className: `dnd-panel-title`,
                style: { width: `100%`, textAlign: `center` },
                children: `Hit Points`,
              }),
              (0, b.jsx)(me, {
                customclass: `dnd5e_health_value`,
                Api: e,
                propertyName: `hp`,
                label: `Current`,
              }),
              (0, b.jsx)(me, {
                customclass: `dnd5e_health_value`,
                Api: e,
                propertyName: `maxhp`,
                label: `Maximum`,
              }),
            ],
          }),
          (0, b.jsxs)(`div`, {
            className: `dnd5e_health_bar`,
            children: [
              (0, b.jsx)(`div`, {
                className: `dnd-panel-title`,
                style: { width: `100%`, textAlign: `center` },
                children: `Temp HP`,
              }),
              (0, b.jsx)(me, {
                customclass: `dnd5e_health_value`,
                Api: e,
                propertyName: `temphp`,
                label: `Current`,
              }),
              (0, b.jsx)(me, {
                customclass: `dnd5e_health_value`,
                Api: e,
                propertyName: `tempmaxhp`,
                label: `Maximum`,
              }),
            ],
          }),
          (0, b.jsxs)(`div`, {
            className: `dnd5e_health_bar`,
            children: [
              (0, b.jsx)(`div`, {
                className: `dnd-panel-title`,
                style: { width: `100%`, textAlign: `center` },
                children: `Hit Dice`,
              }),
              (0, b.jsx)(me, {
                customclass: `dnd5e_health_value`,
                Api: e,
                propertyName: `hitdice`,
                rollLabel: `Roll`,
                rollOnClick: () => {},
                label: `Used`,
              }),
              (0, b.jsx)(me, {
                customclass: `dnd5e_health_value`,
                Api: e,
                propertyName: `hitdicemax`,
                label: `Total`,
              }),
            ],
          }),
        ],
      })
    );
  },
  ge = ({ Api: e }) => {
    let [t, n] = k([e, `death_save_success`, 0]),
      [r, i] = k([e, `death_save_failure`, 0]),
      a = (e) => {
        n(t === e ? e - 1 : e);
      },
      o = (e) => {
        i(r === e ? e - 1 : e);
      };
    return (0, b.jsxs)(`div`, {
      className: `dnd5e_death_saves_container`,
      children: [
        (0, b.jsx)(`div`, {
          className: `dnd-panel-title`,
          children: `Death Saves`,
        }),
        (0, b.jsxs)(`div`, {
          className: `dnd5e_death_saves`,
          children: [
            (0, b.jsxs)(`div`, {
              className: `dnd5e_death_saves_success`,
              children: [
                `Success`,
                (0, b.jsx)(`input`, {
                  className: `dnd5e_death_saves_success_checkbox`,
                  type: `checkbox`,
                  checked: t > 0,
                  onChange: () => a(1),
                }),
                (0, b.jsx)(`input`, {
                  className: `dnd5e_death_saves_success_checkbox`,
                  type: `checkbox`,
                  checked: t > 1,
                  onChange: () => a(2),
                }),
                (0, b.jsx)(`input`, {
                  className: `dnd5e_death_saves_success_checkbox`,
                  type: `checkbox`,
                  checked: t > 2,
                  onChange: () => a(3),
                }),
              ],
            }),
            (0, b.jsxs)(`div`, {
              className: `dnd5e_death_saves_failure`,
              children: [
                `Failure`,
                (0, b.jsx)(`input`, {
                  className: `dnd5e_death_saves_failure_checkbox`,
                  type: `checkbox`,
                  checked: r > 0,
                  onChange: () => o(1),
                }),
                (0, b.jsx)(`input`, {
                  className: `dnd5e_death_saves_failure_checkbox`,
                  type: `checkbox`,
                  checked: r > 1,
                  onChange: () => o(2),
                }),
                (0, b.jsx)(`input`, {
                  className: `dnd5e_death_saves_failure_checkbox`,
                  type: `checkbox`,
                  checked: r > 2,
                  onChange: () => o(3),
                }),
              ],
            }),
            (0, b.jsx)(`button`, {
              style: { marginTop: `6px`, alignSelf: `flex-start` },
              onClick: () => {
                e.FireAction(`dnd5e/roll_death_save`, {});
              },
              children: `Roll Death Save`,
            }),
          ],
        }),
      ],
    });
  };
function _e(e) {
  return se({
    tag: `svg`,
    attr: { viewBox: `0 0 512 512` },
    child: [
      {
        tag: `path`,
        attr: {
          d: `M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z`,
        },
        child: [],
      },
    ],
  })(e);
}
function ve(e) {
  return se({
    tag: `svg`,
    attr: { viewBox: `0 0 448 512` },
    child: [
      {
        tag: `path`,
        attr: {
          d: `M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z`,
        },
        child: [],
      },
    ],
  })(e);
}
function ye(e) {
  return se({
    tag: `svg`,
    attr: { viewBox: `0 0 448 512` },
    child: [
      {
        tag: `path`,
        attr: {
          d: `M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z`,
        },
        child: [],
      },
    ],
  })(e);
}
function be(e) {
  return se({
    tag: `svg`,
    attr: { viewBox: `0 0 320 512` },
    child: [
      {
        tag: `path`,
        attr: {
          d: `M96 32H32C14.33 32 0 46.33 0 64v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32V64c0-17.67-14.33-32-32-32zm0 160H32c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32v-64c0-17.67-14.33-32-32-32zm0 160H32c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32v-64c0-17.67-14.33-32-32-32zM288 32h-64c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32V64c0-17.67-14.33-32-32-32zm0 160h-64c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32v-64c0-17.67-14.33-32-32-32zm0 160h-64c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32v-64c0-17.67-14.33-32-32-32z`,
        },
        child: [],
      },
    ],
  })(e);
}
function xe(e) {
  return se({
    tag: `svg`,
    attr: { viewBox: `0 0 640 512` },
    child: [
      {
        tag: `path`,
        attr: {
          d: `M592 192H473.26c12.69 29.59 7.12 65.2-17 89.32L320 417.58V464c0 26.51 21.49 48 48 48h224c26.51 0 48-21.49 48-48V240c0-26.51-21.49-48-48-48zM480 376c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm-46.37-186.7L258.7 14.37c-19.16-19.16-50.23-19.16-69.39 0L14.37 189.3c-19.16 19.16-19.16 50.23 0 69.39L189.3 433.63c19.16 19.16 50.23 19.16 69.39 0L433.63 258.7c19.16-19.17 19.16-50.24 0-69.4zM96 248c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm128 128c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm0-128c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm0-128c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm128 128c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24z`,
        },
        child: [],
      },
    ],
  })(e);
}
function Se(e) {
  return se({
    tag: `svg`,
    attr: { viewBox: `0 0 320 512` },
    child: [
      {
        tag: `path`,
        attr: {
          d: `M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z`,
        },
        child: [],
      },
    ],
  })(e);
}
function Ce(e) {
  return se({
    tag: `svg`,
    attr: { viewBox: `0 0 448 512` },
    child: [
      {
        tag: `path`,
        attr: {
          d: `M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z`,
        },
        child: [],
      },
    ],
  })(e);
}
function we(e) {
  return se({
    tag: `svg`,
    attr: { viewBox: `0 0 256 512` },
    child: [
      {
        tag: `path`,
        attr: {
          d: `M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z`,
        },
        child: [],
      },
    ],
  })(e);
}
function Te(e) {
  return se({
    tag: `svg`,
    attr: { viewBox: `0 0 320 512` },
    child: [
      {
        tag: `path`,
        attr: {
          d: `M143 352.3L7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4 96.4-96.4c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9l-136 136c-9.2 9.4-24.4 9.4-33.8 0z`,
        },
        child: [],
      },
    ],
  })(e);
}
var Ee = ([e, t, n = !1]) => {
    let [r, i] = _.useState(void 0),
      [a, o] = _.useState(0),
      s = t + `_count`,
      c = a?.value ? parseInt(a?.value) : 0,
      l = _.useMemo(
        () =>
          r
            ? n
              ? r.map((e) => JSON.parse(e.value))
              : r.map((e) => e.value)
            : [],
        [r],
      );
    return (
      _.useEffect(() => {
        let n = (async () => {
          async function n() {
            let n = await e.Properties.Get(s),
              r = parseInt(n?.value);
            o(n);
            let a = [];
            for (let e = 0; e < r; e++) a.push(t + `_` + e);
            i(await e.Properties.GetMany(a));
          }
          let r = async () => {
            await n();
          };
          return (
            e.Properties.Subscribe(t + `_notify`, r),
            await e.Properties.Init(s, 0),
            await n(),
            () => {
              e.Properties.Unsubscribe(t + `_notify`, r);
            }
          );
        })();
        return () => {
          n.then((e) => e && e());
        };
      }, [t]),
      [
        l,
        a,
        async (r) => {
          let i = c + 1;
          (await e.Properties.Set(s, i),
            await e.Properties.Set(
              t + `_` + (i - 1),
              n ? JSON.stringify(r) : r,
            ),
            await e.Properties.Set(t + `_notify`, Date.now()));
        },
        async (n) => {
          (await e.Properties.Remove(t + `_` + n),
            await e.Properties.Set(s, c - 1));
          for (let r = n + 1; r < c; r++) {
            let n = await e.Properties.Get(t + `_` + r);
            await e.Properties.Set(t + `_` + (r - 1), n.value);
          }
          await e.Properties.Set(t + `_notify`, Date.now());
        },
        async (r, i) => {
          (await e.Properties.Set(t + `_` + r, n ? JSON.stringify(i) : i),
            await e.Properties.Set(t + `_notify`, Date.now()));
        },
      ]
    );
  },
  De = (e) =>
    (e ?? ``)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, `_`)
      .replace(/^_+|_+$/g, ``) || `source`,
  Oe = (e) => {
    let [t, n] = _.useState(null),
      [r, i] = _.useState(!1),
      [a, o] = _.useState(null),
      s = _.useRef(null);
    return {
      items: t,
      loading: r,
      error: a,
      load: _.useCallback(async () => {
        t !== null ||
          s.current ||
          (s.current = (async () => {
            (i(!0), o(null));
            try {
              let t = await e.ClientMediator.sendCommandAsync(
                  `Game`,
                  `GetGameId`,
                ),
                r = await e.Properties.Global.Get(t, `dnd5e_config`);
              if (!r?.value) {
                n([]);
                return;
              }
              let i;
              try {
                i = typeof r.value == `string` ? JSON.parse(r.value) : r.value;
              } catch {
                i = {};
              }
              let a = Array.isArray(i.itemSources) ? i.itemSources : [];
              if (a.length === 0) {
                n([]);
                return;
              }
              n(
                (
                  await Promise.all(
                    a.map(async (t) => {
                      let n = `dnd5e_items_${De(t.name)}`;
                      try {
                        let t = await e.Resources.Global.Read(n);
                        if (!t) return [];
                        let r;
                        return (
                          (r =
                            t instanceof Blob
                              ? JSON.parse(await t.text())
                              : typeof t == `string`
                                ? JSON.parse(t)
                                : t),
                          r.item ?? []
                        );
                      } catch (e) {
                        return (
                          console.warn(`useItemsData: failed to load ${n}:`, e),
                          []
                        );
                      }
                    }),
                  )
                ).flat(),
              );
            } catch (e) {
              (console.error(`useItemsData: failed to load items:`, e),
                o(e.message ?? `Load failed`),
                n([]),
                (s.current = null));
            } finally {
              i(!1);
            }
          })());
      }, [e, t]),
    };
  },
  ke = {
    B: `Bludgeoning`,
    P: `Piercing`,
    S: `Slashing`,
    F: `Fire`,
    C: `Cold`,
    L: `Lightning`,
    A: `Acid`,
    N: `Necrotic`,
    R: `Radiant`,
    T: `Thunder`,
    O: `Poison`,
    Y: `Psychic`,
  },
  Ae = {
    M: `Melee Weapon`,
    R: `Ranged Weapon`,
    A: `Ammunition`,
    HA: `Heavy Armor`,
    MA: `Medium Armor`,
    LA: `Light Armor`,
    S: `Shield`,
    G: `Gear`,
    P: `Potion`,
    T: `Tool`,
    SCF: `Spellcasting Focus`,
    FD: `Food & Drink`,
    INS: `Instrument`,
  },
  je = (e) => e.replace(/\{@\w+ ([^|}]+)(?:\|[^}]*)?\}/g, `$1`),
  Me = (e) => {
    if (!e || !Array.isArray(e)) return ``;
    let t = [];
    for (let n of e)
      if (typeof n == `string`) t.push(je(n));
      else if (n && typeof n == `object`) {
        let e = Me(n.entries ?? n.items ?? n.rows ?? []);
        e && t.push(e);
      }
    return t.join(`

`);
  },
  Ne = (e) =>
    e
      ? e >= 100
        ? `${e % 100 == 0 ? e / 100 : (e / 100).toFixed(1)} gp`
        : e >= 10
          ? `${Math.floor(e / 10)} sp`
          : `${e} cp`
      : ``,
  Pe = (e) => {
    if (!e) return ``;
    let t = e.split(`|`)[0];
    return Ae[t] ?? t;
  },
  Fe = () => Date.now().toString(36) + Math.random().toString(36).slice(2),
  Ie = {
    A: `Abjuration`,
    C: `Conjuration`,
    D: `Divination`,
    E: `Enchantment`,
    I: `Illusion`,
    N: `Necromancy`,
    T: `Transmutation`,
    V: `Evocation`,
  },
  Le = (e) => {
    if (!Array.isArray(e) || !e.length) return `1 action`;
    let t = e[0];
    return `${t.number} ${t.unit}`;
  },
  Re = (e) => {
    if (!e) return `—`;
    if (e.type === `special`) return `Special`;
    if (e.type === `sight`) return `Sight`;
    if (e.type === `unlimited`) return `Unlimited`;
    let t = e.distance;
    return t
      ? t.type === `self`
        ? `Self`
        : t.type === `touch`
          ? `Touch`
          : `${t.amount} ft.`
      : e.type;
  },
  ze = (e) => {
    if (!Array.isArray(e) || !e.length) return `Instantaneous`;
    let t = e[0];
    if (t.type === `instant`) return `Instantaneous`;
    if (t.type === `permanent`) return `Until dispelled`;
    if (t.type === `special`) return `Special`;
    if (t.type === `timed` && t.duration) {
      let e = `${t.duration.amount} ${t.duration.type}`;
      return t.concentration ? `${e} (C)` : e;
    }
    return `Instantaneous`;
  },
  Be = (e) => {
    if (!e) return ``;
    let t = [];
    return (
      e.v && t.push(`V`),
      e.s && t.push(`S`),
      e.m && t.push(typeof e.m == `string` ? `M (${e.m})` : `M (${e.m.text})`),
      t.join(`, `)
    );
  },
  Ve = (e) => ({
    id: Fe(),
    name: e.name,
    source: e.source ?? ``,
    level: String(e.level ?? 0),
    school: e.school ?? `V`,
    castingTime: Le(e.time),
    range: Re(e.range),
    duration: ze(e.duration),
    components: Be(e.components),
    concentration: !!e.duration?.[0]?.concentration,
    ritual: !!e.meta?.ritual,
    prepared: !1,
    action: ``,
    actionArgs: ``,
    description: Me(e.entries ?? []),
    descHigher: Me(e.entriesHigherLevel?.[0]?.entries ?? []),
  }),
  He = () => ({
    id: Fe(),
    name: ``,
    source: ``,
    quantity: `1`,
    weight: ``,
    action: ``,
    actionArgs: ``,
    description: ``,
    rarity: ``,
    dmg1: ``,
    dmgType: ``,
    value: ``,
    itemType: ``,
  }),
  Ue = (e) => ({
    id: Fe(),
    name: e.name,
    source: e.source ?? ``,
    quantity: `1`,
    weight: String(e.weight ?? ``),
    action: ``,
    actionArgs: ``,
    description: Me(e.entries),
    rarity: e.rarity && e.rarity !== `none` ? e.rarity : ``,
    dmg1: e.dmg1 ?? ``,
    dmgType: e.dmgType ?? ``,
    value: e.value ? Ne(e.value) : ``,
    itemType: Pe(e.type),
  }),
  We = ({ itemsData: e, onAdd: t, onClose: n }) => {
    let [r, i] = _.useState(``),
      { items: a, loading: o, error: s, load: c } = e,
      l = _.useRef(null),
      u = _.useRef(null);
    (_.useEffect(() => {
      (c(), l.current?.focus());
    }, []),
      _.useEffect(() => {
        let e = (e) => {
          u.current && !u.current.contains(e.target) && n();
        };
        return (
          document.addEventListener(`mousedown`, e),
          () => document.removeEventListener(`mousedown`, e)
        );
      }, [n]));
    let d = _.useMemo(() => {
      if (!a || r.trim().length < 1) return [];
      let e = r.toLowerCase();
      return a.filter((t) => t.name.toLowerCase().includes(e)).slice(0, 20);
    }, [a, r]);
    return (0, b.jsxs)(`div`, {
      className: `dnd5e_item_search_panel`,
      ref: u,
      children: [
        (0, b.jsx)(`input`, {
          ref: l,
          className: `dnd5e_item_search_input`,
          placeholder: o
            ? `Loading items…`
            : s
              ? `Error: ${s}`
              : `Search weapons & items…`,
          value: r,
          onChange: (e) => i(e.target.value),
          onKeyDown: (e) => e.key === `Escape` && n(),
        }),
        d.length > 0 &&
          (0, b.jsx)(`div`, {
            className: `dnd5e_item_search_results`,
            children: d.map((e) =>
              (0, b.jsxs)(
                `div`,
                {
                  className: `dnd5e_item_search_result`,
                  onMouseDown: (r) => {
                    (r.preventDefault(), t(Ue(e)), n());
                  },
                  children: [
                    (0, b.jsx)(`span`, {
                      className: `dnd5e_item_search_result_name`,
                      children: e.name,
                    }),
                    (0, b.jsxs)(`span`, {
                      className: `dnd5e_item_search_result_tags`,
                      children: [
                        e.source &&
                          (0, b.jsx)(`span`, {
                            className: `dnd5e_item_tag dnd5e_item_tag_source`,
                            children: e.source,
                          }),
                        e.dmg1 &&
                          (0, b.jsxs)(`span`, {
                            className: `dnd5e_item_tag dnd5e_item_tag_weapon`,
                            children: [e.dmg1, ` `, ke[e.dmgType] ?? e.dmgType],
                          }),
                        e.type &&
                          (0, b.jsx)(`span`, {
                            className: `dnd5e_item_tag`,
                            children: Pe(e.type),
                          }),
                        e.rarity &&
                          e.rarity !== `none` &&
                          (0, b.jsx)(`span`, {
                            className: `dnd5e_item_tag dnd5e_item_tag_rarity dnd5e_item_rarity_${e.rarity.replace(/\s/g, `_`)}`,
                            children: e.rarity,
                          }),
                      ],
                    }),
                  ],
                },
                `${e.name}|${e.source}`,
              ),
            ),
          }),
        r.trim().length > 0 &&
          a &&
          d.length === 0 &&
          !o &&
          (0, b.jsxs)(`div`, {
            className: `dnd5e_item_search_empty`,
            children: [`No items found for "`, r, `"`],
          }),
      ],
    });
  },
  Ge = ({ Api: e }) => {
    let [t, , n, r, i] = Ee([e, `inventory`, !0]),
      [a, o] = _.useState(!1),
      [s, c] = _.useState(!1),
      l = Oe(e),
      u = _.useRef(null),
      d = _.useMemo(
        () =>
          t.reduce(
            (e, t) => e + parseFloat(t.weight || 0) * parseInt(t.quantity || 0),
            0,
          ),
        [t],
      );
    return (0, b.jsxs)(`div`, {
      className: `dnd5e_inventory_container`,
      children: [
        (0, b.jsxs)(`div`, {
          className: `dnd5e_inventory_toolbar`,
          children: [
            (0, b.jsxs)(`button`, {
              className: `dnd5e_inventory_search_btn`,
              onClick: () => {
                c((e) => !e);
              },
              children: [
                (0, b.jsx)(_e, {}),
                (0, b.jsx)(`span`, { children: `Search Items` }),
              ],
            }),
            (0, b.jsx)(`button`, {
              className: `dnd5e_inventory_add_btn`,
              title: `Add blank item`,
              onClick: () => n(He()),
              children: (0, b.jsx)(ve, {}),
            }),
            (0, b.jsx)(`div`, { style: { flex: 1 } }),
            (0, b.jsx)(`button`, {
              className: `dnd5e_inventory_edit_btn${a ? ` active` : ``}`,
              onClick: () => o(!a),
              children: a ? `✓ Done` : `Edit`,
            }),
          ],
        }),
        s && (0, b.jsx)(We, { itemsData: l, onAdd: n, onClose: () => c(!1) }),
        t.length > 0 &&
          (0, b.jsxs)(`div`, {
            className: `dnd5e_inventory_header`,
            children: [
              (0, b.jsx)(`div`, { className: `dnd5e_inventory_col_icon` }),
              (0, b.jsx)(`div`, {
                className: `dnd5e_inventory_col_name`,
                children: `Item`,
              }),
              (0, b.jsx)(`div`, {
                className: `dnd5e_inventory_col_qty`,
                children: `Qty`,
              }),
              (0, b.jsx)(`div`, {
                className: `dnd5e_inventory_col_weight`,
                children: `Total Wt`,
              }),
              (0, b.jsx)(`div`, { className: `dnd5e_inventory_col_end` }),
            ],
          }),
        (0, b.jsxs)(`div`, {
          className: `dnd5e_inventory_list`,
          children: [
            t.length === 0 &&
              (0, b.jsxs)(`div`, {
                className: `dnd5e_inventory_empty`,
                children: [
                  (0, b.jsx)(`span`, { children: `No items yet.` }),
                  (0, b.jsx)(`span`, {
                    children: `Search the SRD or add a blank item above.`,
                  }),
                ],
              }),
            t.map((n, o) =>
              (0, b.jsx)(
                Ke,
                {
                  Api: e,
                  item: n,
                  index: o,
                  edit: a,
                  removeItem: r,
                  updateItem: i,
                  onDragStart: (e, t) => {
                    u.current = { item: e, index: t };
                  },
                  onDrop: (e) => {
                    if (!u.current) return;
                    let { index: n, item: r } = u.current;
                    (n !== e && (i(e, r), i(n, { ...t[e] })),
                      (u.current = null));
                  },
                },
                n.id ?? `inventory_item_` + o + n.name,
              ),
            ),
          ],
        }),
        t.length > 0 &&
          (0, b.jsxs)(`div`, {
            className: `dnd5e_inventory_weight_summary`,
            children: [
              (0, b.jsx)(`span`, { children: `Carried Weight` }),
              (0, b.jsxs)(`span`, {
                children: [
                  ((e) => (e % 1 == 0 ? `${e}` : e.toFixed(1)))(d),
                  ` lb`,
                ],
              }),
            ],
          }),
      ],
    });
  },
  Ke = ({
    Api: e,
    item: t,
    index: n,
    removeItem: r,
    edit: i,
    onDragStart: a,
    updateItem: o,
    onDrop: s,
  }) => {
    let [c, l] = _.useState(t.name),
      [u, d] = _.useState(t.quantity ?? `1`),
      [f, p] = _.useState(t.weight),
      [m, h] = _.useState(t.action),
      [g, v] = _.useState(t.actionArgs ?? ``),
      [y, x] = _.useState(!1),
      [S, C] = _.useState(!1),
      w = (e = {}) => {
        o(n, {
          ...t,
          name: c,
          quantity: u,
          weight: f,
          action: m,
          actionArgs: g,
          ...e,
        });
      },
      ee = (e) => {
        let t = String(Math.max(0, parseInt(u || `0`) + e));
        (d(t), w({ quantity: t }));
      },
      te = () => {
        if (!t.action) return;
        let n = {};
        try {
          let e = t.actionArgs ? JSON.parse(t.actionArgs) : {};
          typeof e == `object` && e && !Array.isArray(e) && (n = e);
        } catch {}
        e.FireAction(t.action, {
          name: t.name,
          quantity: t.quantity,
          weight: t.weight,
          ...n,
        });
      },
      T = t.description || t.rarity || t.dmg1 || t.value || t.itemType,
      E = (t.description ?? ``)
        .split(
          `

`,
        )
        .filter(Boolean),
      ne = parseFloat(f || 0),
      re = parseInt(u || 0),
      ie = ne > 0 && re > 0 ? ne * re : null;
    return (0, b.jsxs)(`div`, {
      draggable: i,
      onDragStart: () => a(t, n),
      onDragOver: (e) => {
        (e.preventDefault(), C(!0));
      },
      onDragLeave: (e) => {
        (e.preventDefault(), C(!1));
      },
      onDrop: (e) => {
        (e.preventDefault(), C(!1), s && s(n));
      },
      className: `dnd5e_inventory_item${S ? ` drag-over` : ``}`,
      children: [
        (0, b.jsxs)(`div`, {
          className: `dnd5e_inventory_item_row`,
          children: [
            i
              ? (0, b.jsx)(`div`, {
                  className: `dnd5e_inventory_col_icon dnd5e_drag_handle`,
                  title: `Drag to reorder`,
                  children: (0, b.jsx)(be, { size: 11 }),
                })
              : (0, b.jsx)(`div`, {
                  className: `dnd5e_inventory_col_icon dnd5e_inventory_item_toggle`,
                  style: {
                    opacity: T ? 1 : 0.25,
                    cursor: T ? `pointer` : `default`,
                  },
                  onClick: () => T && x((e) => !e),
                  children: y
                    ? (0, b.jsx)(Ce, { size: 9 })
                    : (0, b.jsx)(Se, { size: 9 }),
                }),
            (0, b.jsx)(`div`, {
              className: `dnd5e_inventory_col_name dnd5e_inventory_item_name`,
              onClick: () => !i && T && x((e) => !e),
              style: { cursor: !i && T ? `pointer` : `default` },
              children: i
                ? (0, b.jsx)(`input`, {
                    value: c,
                    onChange: (e) => l(e.target.value),
                    onBlur: () => w(),
                    placeholder: `Item name`,
                  })
                : (0, b.jsx)(`span`, {
                    className: T ? `dnd5e_item_name_link` : ``,
                    children:
                      c ||
                      (0, b.jsx)(`em`, {
                        className: `dnd5e_item_name_placeholder`,
                        children: `Unnamed`,
                      }),
                  }),
            }),
            (0, b.jsx)(`div`, {
              className: `dnd5e_inventory_col_qty`,
              children: i
                ? (0, b.jsx)(`input`, {
                    className: `dnd5e_inventory_qty_input`,
                    value: u,
                    onChange: (e) => d(e.target.value),
                    onBlur: () => w(),
                  })
                : (0, b.jsxs)(`div`, {
                    className: `dnd5e_qty_stepper`,
                    children: [
                      (0, b.jsx)(`button`, {
                        className: `dnd5e_qty_btn`,
                        onClick: () => ee(-1),
                        title: `Decrease`,
                        children: `−`,
                      }),
                      (0, b.jsx)(`span`, {
                        className: `dnd5e_qty_val`,
                        children: u,
                      }),
                      (0, b.jsx)(`button`, {
                        className: `dnd5e_qty_btn`,
                        onClick: () => ee(1),
                        title: `Increase`,
                        children: `+`,
                      }),
                    ],
                  }),
            }),
            (0, b.jsx)(`div`, {
              className: `dnd5e_inventory_col_weight`,
              children: i
                ? (0, b.jsx)(`input`, {
                    className: `dnd5e_inventory_wt_input`,
                    value: f,
                    onChange: (e) => p(e.target.value),
                    onBlur: () => w(),
                    placeholder: `lb ea`,
                  })
                : ie == null
                  ? null
                  : (0, b.jsxs)(`span`, {
                      className: `dnd5e_inventory_wt_label`,
                      children: [
                        ((e) => (e % 1 == 0 ? `${e}` : e.toFixed(1)))(ie),
                        (0, b.jsx)(`em`, { children: `lb` }),
                      ],
                    }),
            }),
            (0, b.jsxs)(`div`, {
              className: `dnd5e_inventory_col_end`,
              children: [
                !i &&
                  t.action &&
                  (0, b.jsxs)(`button`, {
                    className: `dnd5e_use_btn`,
                    onClick: te,
                    title: `Use: ${t.action}`,
                    children: [(0, b.jsx)(xe, { size: 10 }), ` Use`],
                  }),
                i &&
                  (0, b.jsx)(`button`, {
                    className: `dnd5e_remove_btn`,
                    onClick: () => r(n),
                    title: `Remove item`,
                    children: (0, b.jsx)(ye, { size: 9 }),
                  }),
              ],
            }),
          ],
        }),
        i &&
          (0, b.jsxs)(`div`, {
            className: `dnd5e_inventory_edit_extras`,
            children: [
              (0, b.jsx)(`input`, {
                className: `dnd5e_inventory_action_input`,
                placeholder: `Action name (optional)`,
                value: m,
                onChange: (e) => h(e.target.value),
                onBlur: () => w(),
              }),
              (0, b.jsx)(`input`, {
                className: `dnd5e_inventory_action_input`,
                placeholder: `Action args, e.g. {"damage":"1d6"}`,
                value: g,
                onChange: (e) => v(e.target.value),
                onBlur: () => w(),
              }),
            ],
          }),
        y &&
          T &&
          (0, b.jsxs)(`div`, {
            className: `dnd5e_inventory_item_details`,
            children: [
              (0, b.jsxs)(`div`, {
                className: `dnd5e_inventory_item_tags`,
                children: [
                  t.itemType &&
                    (0, b.jsx)(`span`, {
                      className: `dnd5e_item_tag`,
                      children: t.itemType,
                    }),
                  t.dmg1 &&
                    (0, b.jsxs)(`span`, {
                      className: `dnd5e_item_tag dnd5e_item_tag_weapon`,
                      children: [
                        t.dmg1,
                        t.dmgType ? ` ${ke[t.dmgType] ?? t.dmgType}` : ``,
                      ],
                    }),
                  t.rarity &&
                    (0, b.jsx)(`span`, {
                      className: `dnd5e_item_tag dnd5e_item_tag_rarity dnd5e_item_rarity_${t.rarity.replace(/\s/g, `_`)}`,
                      children: t.rarity,
                    }),
                  t.value &&
                    (0, b.jsx)(`span`, {
                      className: `dnd5e_item_tag dnd5e_item_tag_value`,
                      children: t.value,
                    }),
                  t.weight &&
                    (0, b.jsxs)(`span`, {
                      className: `dnd5e_item_tag`,
                      children: [t.weight, ` lb ea`],
                    }),
                ],
              }),
              E.map((e, t) =>
                (0, b.jsx)(
                  `p`,
                  { className: `dnd5e_inventory_item_desc`, children: e },
                  t,
                ),
              ),
            ],
          }),
      ],
    });
  },
  qe = new Set([`M`, `R`]),
  Je = () => ({
    id: Fe(),
    name: ``,
    source: ``,
    attackBonus: `+0`,
    damage: `1d6`,
    damageType: `Slashing`,
    action: `dnd_attack`,
    actionArgs: ``,
    description: ``,
    rarity: ``,
    itemType: ``,
    weaponCategory: ``,
  }),
  Ye = (e) => ({
    id: Fe(),
    name: e.name,
    source: e.source ?? ``,
    attackBonus: `+0`,
    damage: e.dmg1 ?? ``,
    damageType: ke[e.dmgType] ?? e.dmgType ?? ``,
    action: `dnd_attack`,
    actionArgs: ``,
    description: Me(e.entries),
    rarity: e.rarity && e.rarity !== `none` ? e.rarity : ``,
    itemType: Pe(e.type),
    weaponCategory: e.weaponCategory ?? ``,
  }),
  Xe = ({ itemsData: e, onAdd: t, onClose: n }) => {
    let [r, i] = _.useState(``),
      { items: a, loading: o, error: s, load: c } = e,
      l = _.useRef(null),
      u = _.useRef(null);
    (_.useEffect(() => {
      (c(), l.current?.focus());
    }, []),
      _.useEffect(() => {
        let e = (e) => {
          u.current && !u.current.contains(e.target) && n();
        };
        return (
          document.addEventListener(`mousedown`, e),
          () => document.removeEventListener(`mousedown`, e)
        );
      }, [n]));
    let d = _.useMemo(() => {
      if (!a || r.trim().length < 1) return [];
      let e = r.toLowerCase();
      return a
        .filter(
          (t) =>
            qe.has(t.type?.split(`|`)[0]) && t.name.toLowerCase().includes(e),
        )
        .slice(0, 20);
    }, [a, r]);
    return (0, b.jsxs)(`div`, {
      className: `dnd5e_item_search_panel`,
      ref: u,
      children: [
        (0, b.jsx)(`input`, {
          ref: l,
          className: `dnd5e_item_search_input`,
          placeholder: o
            ? `Loading weapons…`
            : s
              ? `Error: ${s}`
              : `Search weapons…`,
          value: r,
          onChange: (e) => i(e.target.value),
          onKeyDown: (e) => e.key === `Escape` && n(),
        }),
        d.length > 0 &&
          (0, b.jsx)(`div`, {
            className: `dnd5e_item_search_results`,
            children: d.map((e) =>
              (0, b.jsxs)(
                `div`,
                {
                  className: `dnd5e_item_search_result`,
                  onMouseDown: (r) => {
                    (r.preventDefault(), t(Ye(e)), n());
                  },
                  children: [
                    (0, b.jsx)(`span`, {
                      className: `dnd5e_item_search_result_name`,
                      children: e.name,
                    }),
                    (0, b.jsxs)(`span`, {
                      className: `dnd5e_item_search_result_tags`,
                      children: [
                        e.source &&
                          (0, b.jsx)(`span`, {
                            className: `dnd5e_item_tag dnd5e_item_tag_source`,
                            children: e.source,
                          }),
                        e.dmg1 &&
                          (0, b.jsxs)(`span`, {
                            className: `dnd5e_item_tag dnd5e_item_tag_weapon`,
                            children: [
                              e.dmg1,
                              ` `,
                              ke[e.dmgType] ?? e.dmgType ?? ``,
                            ],
                          }),
                        e.weaponCategory &&
                          (0, b.jsx)(`span`, {
                            className: `dnd5e_item_tag`,
                            children: e.weaponCategory,
                          }),
                        e.rarity &&
                          e.rarity !== `none` &&
                          (0, b.jsx)(`span`, {
                            className: `dnd5e_item_tag dnd5e_item_tag_rarity dnd5e_item_rarity_${e.rarity.replace(/\s/g, `_`)}`,
                            children: e.rarity,
                          }),
                      ],
                    }),
                  ],
                },
                `${e.name}|${e.source}`,
              ),
            ),
          }),
        r.trim().length > 0 &&
          a &&
          d.length === 0 &&
          !o &&
          (0, b.jsxs)(`div`, {
            className: `dnd5e_item_search_empty`,
            children: [`No weapons found for "`, r, `"`],
          }),
      ],
    });
  },
  Ze = ({ Api: e }) => {
    let [t, , n, r, i] = Ee([e, `weapons`, !0]),
      [a, o] = _.useState(!1),
      [s, c] = _.useState(!1),
      l = Oe(e),
      u = _.useRef(null);
    return (0, b.jsxs)(`div`, {
      className: `dnd5e_inventory_container`,
      children: [
        (0, b.jsxs)(`div`, {
          className: `dnd5e_inventory_toolbar`,
          children: [
            (0, b.jsxs)(`button`, {
              className: `dnd5e_inventory_search_btn`,
              onClick: () => c((e) => !e),
              children: [
                (0, b.jsx)(_e, {}),
                (0, b.jsx)(`span`, { children: `Search Weapons` }),
              ],
            }),
            (0, b.jsx)(`button`, {
              className: `dnd5e_inventory_add_btn`,
              title: `Add blank weapon`,
              onClick: () => n(Je()),
              children: (0, b.jsx)(ve, {}),
            }),
            (0, b.jsx)(`div`, { style: { flex: 1 } }),
            (0, b.jsx)(`button`, {
              className: `dnd5e_inventory_edit_btn${a ? ` active` : ``}`,
              onClick: () => o(!a),
              children: a ? `✓ Done` : `Edit`,
            }),
          ],
        }),
        s && (0, b.jsx)(Xe, { itemsData: l, onAdd: n, onClose: () => c(!1) }),
        t.length > 0 &&
          (0, b.jsxs)(`div`, {
            className: `dnd5e_inventory_header`,
            children: [
              (0, b.jsx)(`div`, { className: `dnd5e_weapon_col_icon` }),
              (0, b.jsx)(`div`, {
                className: `dnd5e_weapon_col_name`,
                children: `Weapon`,
              }),
              (0, b.jsx)(`div`, {
                className: `dnd5e_weapon_col_bonus`,
                children: `Atk`,
              }),
              (0, b.jsx)(`div`, {
                className: `dnd5e_weapon_col_damage`,
                children: `Damage`,
              }),
              (0, b.jsx)(`div`, { className: `dnd5e_weapon_col_end` }),
            ],
          }),
        (0, b.jsxs)(`div`, {
          className: `dnd5e_inventory_list`,
          children: [
            t.length === 0 &&
              (0, b.jsxs)(`div`, {
                className: `dnd5e_inventory_empty`,
                children: [
                  (0, b.jsx)(`span`, { children: `No weapons yet.` }),
                  (0, b.jsx)(`span`, {
                    children: `Search the SRD or add a blank weapon above.`,
                  }),
                ],
              }),
            t.map((n, o) =>
              (0, b.jsx)(
                Qe,
                {
                  Api: e,
                  item: n,
                  index: o,
                  edit: a,
                  removeItem: r,
                  updateItem: i,
                  onDragStart: (e, t) => {
                    u.current = { item: e, index: t };
                  },
                  onDrop: (e) => {
                    if (!u.current) return;
                    let { index: n, item: r } = u.current;
                    (n !== e && (i(e, r), i(n, { ...t[e] })),
                      (u.current = null));
                  },
                },
                n.id ?? `weapon_${o}_${n.name}`,
              ),
            ),
          ],
        }),
      ],
    });
  },
  Qe = ({
    Api: e,
    item: t,
    index: n,
    removeItem: r,
    edit: i,
    onDragStart: a,
    updateItem: o,
    onDrop: s,
  }) => {
    let [c, l] = _.useState(t.name ?? ``),
      [u, d] = _.useState(t.attackBonus ?? `+0`),
      [f, p] = _.useState(t.damage ?? ``),
      [m, h] = _.useState(t.damageType ?? ``),
      [g, v] = _.useState(t.action ?? ``),
      [y, x] = _.useState(t.actionArgs ?? ``),
      [S, C] = _.useState(!1),
      [w, ee] = _.useState(!1),
      te = (e = {}) => {
        o(n, {
          ...t,
          name: c,
          attackBonus: u,
          damage: f,
          damageType: m,
          action: g,
          actionArgs: y,
          ...e,
        });
      },
      T = () => {
        if (!t.action) return;
        let n = {};
        try {
          let e = t.actionArgs ? JSON.parse(t.actionArgs) : {};
          typeof e == `object` && e && !Array.isArray(e) && (n = e);
        } catch {}
        e.FireAction(t.action, {
          name: t.name,
          attackBonus: t.attackBonus,
          damage: t.damage,
          damageType: t.damageType,
          ...n,
        });
      },
      E = t.description || t.rarity || t.weaponCategory || t.itemType,
      ne = (t.description ?? ``)
        .split(
          `

`,
        )
        .filter(Boolean);
    return (0, b.jsxs)(`div`, {
      draggable: i,
      onDragStart: () => a(t, n),
      onDragOver: (e) => {
        (e.preventDefault(), ee(!0));
      },
      onDragLeave: (e) => {
        (e.preventDefault(), ee(!1));
      },
      onDrop: (e) => {
        (e.preventDefault(), ee(!1), s && s(n));
      },
      className: `dnd5e_inventory_item${w ? ` drag-over` : ``}`,
      children: [
        (0, b.jsxs)(`div`, {
          className: `dnd5e_inventory_item_row`,
          children: [
            i
              ? (0, b.jsx)(`div`, {
                  className: `dnd5e_weapon_col_icon dnd5e_drag_handle`,
                  title: `Drag to reorder`,
                  children: (0, b.jsx)(be, { size: 11 }),
                })
              : (0, b.jsx)(`div`, {
                  className: `dnd5e_weapon_col_icon dnd5e_inventory_item_toggle`,
                  style: {
                    opacity: E ? 1 : 0.25,
                    cursor: E ? `pointer` : `default`,
                  },
                  onClick: () => E && C((e) => !e),
                  children: S
                    ? (0, b.jsx)(Ce, { size: 9 })
                    : (0, b.jsx)(Se, { size: 9 }),
                }),
            (0, b.jsx)(`div`, {
              className: `dnd5e_weapon_col_name dnd5e_inventory_item_name`,
              onClick: () => !i && E && C((e) => !e),
              style: { cursor: !i && E ? `pointer` : `default` },
              children: i
                ? (0, b.jsx)(`input`, {
                    value: c,
                    onChange: (e) => l(e.target.value),
                    onBlur: () => te(),
                    placeholder: `Weapon name`,
                  })
                : (0, b.jsx)(`span`, {
                    className: E ? `dnd5e_item_name_link` : ``,
                    children:
                      c ||
                      (0, b.jsx)(`em`, {
                        className: `dnd5e_item_name_placeholder`,
                        children: `Unnamed`,
                      }),
                  }),
            }),
            (0, b.jsx)(`div`, {
              className: `dnd5e_weapon_col_bonus`,
              children: (0, b.jsx)(`input`, {
                className: `dnd5e_weapon_field_input`,
                value: u,
                onChange: (e) => d(e.target.value),
                onBlur: () => te(),
                placeholder: `+0`,
                readOnly: !i && !1,
              }),
            }),
            (0, b.jsx)(`div`, {
              className: `dnd5e_weapon_col_damage`,
              children: i
                ? (0, b.jsxs)(`div`, {
                    className: `dnd5e_weapon_damage_edit`,
                    children: [
                      (0, b.jsx)(`input`, {
                        className: `dnd5e_weapon_field_input`,
                        value: f,
                        onChange: (e) => p(e.target.value),
                        onBlur: () => te(),
                        placeholder: `1d6`,
                      }),
                      (0, b.jsx)(`input`, {
                        className: `dnd5e_weapon_field_input dnd5e_weapon_dmgtype_input`,
                        value: m,
                        onChange: (e) => h(e.target.value),
                        onBlur: () => te(),
                        placeholder: `Type`,
                      }),
                    ],
                  })
                : (0, b.jsxs)(`span`, {
                    className: `dnd5e_weapon_damage_label`,
                    children: [
                      f,
                      m ? (0, b.jsxs)(`em`, { children: [` `, m] }) : null,
                    ],
                  }),
            }),
            (0, b.jsxs)(`div`, {
              className: `dnd5e_weapon_col_end`,
              children: [
                !i &&
                  t.action &&
                  (0, b.jsxs)(`button`, {
                    className: `dnd5e_use_btn`,
                    onClick: T,
                    title: `Fire: ${t.action}`,
                    children: [(0, b.jsx)(xe, { size: 10 }), ` Attack`],
                  }),
                i &&
                  (0, b.jsx)(`button`, {
                    className: `dnd5e_remove_btn`,
                    onClick: () => r(n),
                    title: `Remove`,
                    children: (0, b.jsx)(ye, { size: 9 }),
                  }),
              ],
            }),
          ],
        }),
        i &&
          (0, b.jsxs)(`div`, {
            className: `dnd5e_inventory_edit_extras`,
            children: [
              (0, b.jsx)(`input`, {
                className: `dnd5e_inventory_action_input`,
                placeholder: `Action name (default: dnd_attack)`,
                value: g,
                onChange: (e) => v(e.target.value),
                onBlur: () => te(),
              }),
              (0, b.jsx)(`input`, {
                className: `dnd5e_inventory_action_input`,
                placeholder: `Action args, e.g. {"crit":"20"}`,
                value: y,
                onChange: (e) => x(e.target.value),
                onBlur: () => te(),
              }),
            ],
          }),
        S &&
          E &&
          (0, b.jsxs)(`div`, {
            className: `dnd5e_inventory_item_details`,
            children: [
              (0, b.jsxs)(`div`, {
                className: `dnd5e_inventory_item_tags`,
                children: [
                  t.itemType &&
                    (0, b.jsx)(`span`, {
                      className: `dnd5e_item_tag`,
                      children: t.itemType,
                    }),
                  t.weaponCategory &&
                    (0, b.jsx)(`span`, {
                      className: `dnd5e_item_tag`,
                      children: t.weaponCategory,
                    }),
                  t.rarity &&
                    (0, b.jsx)(`span`, {
                      className: `dnd5e_item_tag dnd5e_item_tag_rarity dnd5e_item_rarity_${t.rarity.replace(/\s/g, `_`)}`,
                      children: t.rarity,
                    }),
                  t.source &&
                    (0, b.jsx)(`span`, {
                      className: `dnd5e_item_tag dnd5e_item_tag_source`,
                      children: t.source,
                    }),
                ],
              }),
              ne.map((e, t) =>
                (0, b.jsx)(
                  `p`,
                  { className: `dnd5e_inventory_item_desc`, children: e },
                  t,
                ),
              ),
            ],
          }),
      ],
    });
  },
  $e = (e, t, n) => {
    let [r, i] = _.useState(null),
      [a, o] = _.useState(!1),
      [s, c] = _.useState(null),
      l = _.useRef(null);
    return {
      items: r,
      loading: a,
      error: s,
      load: _.useCallback(async () => {
        r !== null ||
          l.current ||
          (l.current = (async () => {
            (o(!0), c(null));
            try {
              let r = await e.Resources.Global.Read(t);
              if (!r) {
                i([]);
                return;
              }
              let a;
              ((a =
                r instanceof Blob
                  ? JSON.parse(await r.text())
                  : typeof r == `string`
                    ? JSON.parse(r)
                    : r),
                i(n ? n(a) : (a.item ?? a)));
            } catch (e) {
              (console.error(`Failed to load ${t}:`, e),
                c(e.message ?? `Load failed`),
                i([]),
                (l.current = null));
            } finally {
              o(!1);
            }
          })());
      }, [e, t, r]),
    };
  },
  et = ({ langData: e, loading: t, onAdd: n, onClose: r }) => {
    let [i, a] = _.useState(``),
      o = _.useRef(null);
    _.useEffect(() => {
      o.current?.focus();
    }, []);
    let s = _.useMemo(() => {
      if (!Array.isArray(e)) return [];
      let t = {};
      for (let n of e)
        (!t[n.name] || [`XPHB`, `PHB`].includes(n.source)) && (t[n.name] = n);
      let n = Object.values(t).sort((e, t) => {
        let n = { standard: 0, exotic: 1, rare: 2, secret: 3 },
          r = n[e.type] ?? 4,
          i = n[t.type] ?? 4;
        return r === i ? e.name.localeCompare(t.name) : r - i;
      });
      if (!i.trim()) return n;
      let r = i.toLowerCase();
      return n.filter((e) => e.name.toLowerCase().includes(r));
    }, [e, i]);
    return (0, b.jsxs)(`div`, {
      className: `dnd5e_lang_search_panel`,
      children: [
        (0, b.jsxs)(`div`, {
          className: `dnd5e_lang_search_bar`,
          children: [
            (0, b.jsx)(`input`, {
              ref: o,
              className: `dnd5e_lang_search_input`,
              placeholder: `Search languages…`,
              value: i,
              onChange: (e) => a(e.target.value),
            }),
            (0, b.jsx)(`button`, {
              className: `dnd5e_profs_close_btn`,
              onClick: r,
              children: `✕`,
            }),
          ],
        }),
        (0, b.jsxs)(`div`, {
          className: `dnd5e_lang_results`,
          children: [
            t &&
              (0, b.jsx)(`div`, {
                className: `dnd5e_lang_status`,
                children: `Loading…`,
              }),
            !t &&
              s.length === 0 &&
              (0, b.jsx)(`div`, {
                className: `dnd5e_lang_status`,
                children: `No results`,
              }),
            s
              .slice(0, 30)
              .map((e) =>
                (0, b.jsxs)(
                  `div`,
                  {
                    className: `dnd5e_lang_result_row`,
                    onClick: () => n(e),
                    children: [
                      (0, b.jsx)(`span`, {
                        className: `dnd5e_lang_result_name`,
                        children: e.name,
                      }),
                      (0, b.jsx)(`span`, {
                        className: `dnd5e_lang_type_badge dnd5e_lang_type_${e.type || `standard`}`,
                        children: e.type || `std`,
                      }),
                    ],
                  },
                  e.name,
                ),
              ),
          ],
        }),
      ],
    });
  },
  tt = ({ placeholder: e, onAdd: t }) => {
    let [n, r] = _.useState(``),
      i = () => {
        let e = n.trim();
        e && (t(e), r(``));
      };
    return (0, b.jsxs)(`div`, {
      className: `dnd5e_profs_add_row`,
      children: [
        (0, b.jsx)(`input`, {
          className: `dnd5e_profs_input`,
          placeholder: e,
          value: n,
          onChange: (e) => r(e.target.value),
          onKeyDown: (e) => {
            e.key === `Enter` && i();
          },
        }),
        (0, b.jsx)(`button`, {
          className: `dnd5e_profs_add_btn`,
          onClick: i,
          children: `+`,
        }),
      ],
    });
  },
  nt = ({ Api: e }) => {
    let [t, , n, r] = Ee([e, `languages`, !0]),
      [i, , a, o] = Ee([e, `proficiencies`, !0]),
      {
        items: s,
        loading: c,
        load: l,
      } = $e(e, `dnd5e_languages`, (e) => e.language ?? e.item ?? e),
      [u, d] = _.useState(!1);
    return (0, b.jsxs)(`div`, {
      className: `dnd5e_profs_container`,
      children: [
        (0, b.jsxs)(`div`, {
          className: `dnd5e_profs_section`,
          children: [
            (0, b.jsxs)(`div`, {
              className: `dnd5e_profs_toolbar`,
              children: [
                (0, b.jsx)(`span`, {
                  className: `dnd5e_profs_title`,
                  children: `Languages`,
                }),
                (0, b.jsx)(`button`, {
                  className: `dnd5e_profs_search_btn`,
                  title: `Search SRD languages`,
                  onClick: () => {
                    (l(), d(!0));
                  },
                  children: (0, b.jsx)(_e, {}),
                }),
              ],
            }),
            u &&
              (0, b.jsx)(et, {
                langData: s,
                loading: c,
                onAdd: (e) => {
                  (n({
                    id: Fe(),
                    name: e.name,
                    type: e.type || `standard`,
                    source: e.source,
                  }),
                    d(!1));
                },
                onClose: () => d(!1),
              }),
            (0, b.jsx)(`div`, {
              className: `dnd5e_chips_list`,
              children: t.map((e, t) =>
                (0, b.jsxs)(
                  `span`,
                  {
                    className: `dnd5e_chip dnd5e_chip_${e.type || `standard`}`,
                    children: [
                      e.name,
                      (0, b.jsx)(`button`, {
                        className: `dnd5e_chip_remove`,
                        onClick: () => r(t),
                        children: `×`,
                      }),
                    ],
                  },
                  e.id ?? t,
                ),
              ),
            }),
            (0, b.jsx)(tt, {
              placeholder: `Custom language…`,
              onAdd: (e) => n({ id: Fe(), name: e, type: `custom` }),
            }),
          ],
        }),
        (0, b.jsxs)(`div`, {
          className: `dnd5e_profs_section`,
          children: [
            (0, b.jsx)(`div`, {
              className: `dnd5e_profs_toolbar`,
              children: (0, b.jsx)(`span`, {
                className: `dnd5e_profs_title`,
                children: `Proficiencies`,
              }),
            }),
            (0, b.jsx)(`div`, {
              className: `dnd5e_chips_list`,
              children: i.map((e, t) =>
                (0, b.jsxs)(
                  `span`,
                  {
                    className: `dnd5e_chip`,
                    children: [
                      e.name,
                      (0, b.jsx)(`button`, {
                        className: `dnd5e_chip_remove`,
                        onClick: () => o(t),
                        children: `×`,
                      }),
                    ],
                  },
                  e.id ?? t,
                ),
              ),
            }),
            (0, b.jsx)(tt, {
              placeholder: `Add proficiency…`,
              onAdd: (e) => a({ id: Fe(), name: e }),
            }),
          ],
        }),
      ],
    });
  },
  rt = ({ Api: e, propertyKey: t, label: n, rows: r = 4 }) => {
    let [i, a] = k([e, t, ``]),
      [o, s] = _.useState(``);
    return (
      _.useEffect(() => {
        s(i ?? ``);
      }, [i]),
      (0, b.jsxs)(`div`, {
        className: `dnd5e_bio_section`,
        children: [
          (0, b.jsx)(`div`, { className: `dnd-panel-title`, children: n }),
          (0, b.jsx)(`textarea`, {
            className: `dnd5e_bio_textarea`,
            value: o,
            onChange: (e) => s(e.target.value),
            onBlur: () => a(o),
            rows: r,
          }),
        ],
      })
    );
  },
  it = ({
    Api: e,
    label: t,
    propertyKey: n,
    resourceKey: r,
    isToken: i = !1,
  }) => {
    let [a, o] = k([e, n, ``]),
      [s, c] = _.useState(``),
      [l, u] = _.useState(!1),
      d = _.useRef(null),
      f = e.cardId || `unknown_card`;
    return (
      _.useEffect(() => {
        if (!a) {
          c(``);
          return;
        }
        let t = null,
          n = a.split(`/`).pop();
        return (
          e.Resources.Read(n).then((e) => {
            if (!e) {
              c(``);
              return;
            }
            if (e instanceof Blob) ((t = URL.createObjectURL(e)), c(t));
            else if (e instanceof ArrayBuffer) {
              let n = new Blob([e]);
              ((t = URL.createObjectURL(n)), c(t));
            } else c(String(e));
          }),
          () => {
            t && URL.revokeObjectURL(t);
          }
        );
      }, [a]),
      (0, b.jsxs)(`div`, {
        className: `dnd5e_bio_portrait dnd-panel`,
        children: [
          (0, b.jsx)(`div`, { className: `dnd-panel-title`, children: t }),
          (0, b.jsxs)(`div`, {
            className: `dnd5e_bio_image_wrapper`,
            onClick: () => d.current?.click(),
            children: [
              s
                ? (0, b.jsx)(`img`, {
                    src: s,
                    alt: t,
                    className: `dnd5e_bio_image${i ? ` dnd5e_bio_image_token` : ``}`,
                  })
                : (0, b.jsx)(`div`, {
                    className: `dnd5e_bio_image_placeholder${i ? ` dnd5e_bio_image_token` : ``}`,
                    children: l ? `Uploading…` : `No image`,
                  }),
              (0, b.jsx)(`div`, {
                className: `dnd5e_bio_image_overlay`,
                children: (0, b.jsx)(`span`, {
                  children: l ? `Uploading…` : `📷 Upload`,
                }),
              }),
            ],
          }),
          (0, b.jsx)(`input`, {
            type: `file`,
            accept: `image/*`,
            ref: d,
            style: { display: `none` },
            onChange: async (t) => {
              let n = t.target.files?.[0];
              if (n) {
                u(!0);
                try {
                  let t = await n.arrayBuffer();
                  (await e.Resources.Upsert(r, t, n.name, n.type),
                    o(`${f}/${r}`));
                } catch (e) {
                  console.error(`ImageUploadPanel: upload failed`, e);
                } finally {
                  (u(!1), (t.target.value = ``));
                }
              }
            },
          }),
        ],
      })
    );
  },
  at = ({ Api: e }) =>
    (0, b.jsxs)(`div`, {
      className: `dnd5e_bio_container`,
      children: [
        (0, b.jsxs)(`div`, {
          className: `dnd5e_bio_images`,
          children: [
            (0, b.jsx)(it, {
              Api: e,
              label: `Character`,
              propertyKey: `character_image_key`,
              resourceKey: `character_image`,
            }),
            (0, b.jsx)(it, {
              Api: e,
              label: `Token`,
              propertyKey: `tokenImage`,
              resourceKey: `tokenImage`,
              isToken: !0,
            }),
          ],
        }),
        (0, b.jsx)(rt, {
          Api: e,
          propertyKey: `bio_appearance`,
          label: `Character Appearance`,
          rows: 4,
        }),
        (0, b.jsx)(rt, {
          Api: e,
          propertyKey: `bio_allies`,
          label: `Allies & Organizations`,
          rows: 4,
        }),
        (0, b.jsx)(rt, {
          Api: e,
          propertyKey: `bio_features`,
          label: `Additional Features & Traits`,
          rows: 5,
        }),
        (0, b.jsx)(rt, {
          Api: e,
          propertyKey: `bio_backstory`,
          label: `Character Backstory`,
          rows: 6,
        }),
        (0, b.jsx)(rt, {
          Api: e,
          propertyKey: `bio_treasure`,
          label: `Treasure`,
          rows: 3,
        }),
      ],
    }),
  ot = (e) =>
    (e ?? ``)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, `_`)
      .replace(/^_+|_+$/g, ``) || `source`,
  st = (e) => {
    let [t, n] = _.useState(null),
      [r, i] = _.useState(!1),
      [a, o] = _.useState(null),
      s = _.useRef(null);
    return {
      spells: t,
      loading: r,
      error: a,
      load: _.useCallback(async () => {
        t !== null ||
          s.current ||
          (s.current = (async () => {
            (i(!0), o(null));
            try {
              let t = await e.ClientMediator.sendCommandAsync(
                  `Game`,
                  `GetGameId`,
                ),
                r = await e.Properties.Global.Get(t, `dnd5e_config`);
              if (!r?.value) {
                n([]);
                return;
              }
              let i;
              try {
                i = typeof r.value == `string` ? JSON.parse(r.value) : r.value;
              } catch {
                i = {};
              }
              let a = Array.isArray(i.spellSources) ? i.spellSources : [];
              if (a.length === 0) {
                n([]);
                return;
              }
              n(
                (
                  await Promise.all(
                    a.map(async (t) => {
                      let n = `dnd5e_spells_${ot(t.name)}`;
                      try {
                        let t = await e.Resources.Global.Read(n);
                        if (!t) return [];
                        let r;
                        return (
                          (r =
                            t instanceof Blob
                              ? JSON.parse(await t.text())
                              : typeof t == `string`
                                ? JSON.parse(t)
                                : t),
                          r.spell ?? r.item ?? []
                        );
                      } catch (e) {
                        return (
                          console.warn(
                            `useSpellsData: failed to load ${n}:`,
                            e,
                          ),
                          []
                        );
                      }
                    }),
                  )
                ).flat(),
              );
            } catch (e) {
              (console.error(`useSpellsData: failed to load spells:`, e),
                o(e.message ?? `Load failed`),
                n([]),
                (s.current = null));
            } finally {
              i(!1);
            }
          })());
      }, [e, t]),
    };
  },
  ct = [
    `Cantrip`,
    `1st`,
    `2nd`,
    `3rd`,
    `4th`,
    `5th`,
    `6th`,
    `7th`,
    `8th`,
    `9th`,
  ],
  lt = (e) => {
    try {
      let t = JSON.parse(e);
      if (typeof t == `object` && t && !Array.isArray(t)) return t;
    } catch {}
    return {};
  },
  ut = ({ spellData: e, loading: t, error: n, onAdd: r, onClose: i }) => {
    let [a, o] = _.useState(``),
      [s, c] = _.useState(null),
      [l, u] = _.useState(null),
      d = _.useRef(null);
    _.useEffect(() => {
      d.current?.focus();
    }, []);
    let f = _.useMemo(() => {
        if (!e) return [];
        let t = e;
        if (a.trim()) {
          let e = a.toLowerCase();
          t = t.filter((t) => t.name.toLowerCase().includes(e));
        }
        return (
          s !== null && (t = t.filter((e) => (e.level ?? 0) === s)),
          l !== null && (t = t.filter((e) => e.school === l)),
          t
            .slice()
            .sort((e, t) =>
              (e.level ?? 0) === (t.level ?? 0)
                ? e.name.localeCompare(t.name)
                : (e.level ?? 0) - (t.level ?? 0),
            )
            .slice(0, 40)
        );
      }, [e, a, s, l]),
      p = _.useMemo(
        () =>
          e ? [...new Set(e.map((e) => e.school).filter(Boolean))].sort() : [],
        [e],
      );
    return (0, b.jsxs)(`div`, {
      className: `dnd5e_item_search_panel`,
      children: [
        (0, b.jsxs)(`div`, {
          className: `dnd5e_item_search_bar`,
          children: [
            (0, b.jsx)(_e, { className: `dnd5e_item_search_icon` }),
            (0, b.jsx)(`input`, {
              ref: d,
              className: `dnd5e_item_search_input`,
              placeholder: `Search spells…`,
              value: a,
              onChange: (e) => o(e.target.value),
            }),
            (0, b.jsx)(`button`, {
              className: `dnd5e_inventory_edit_btn`,
              onClick: i,
              children: `✕`,
            }),
          ],
        }),
        (0, b.jsxs)(`div`, {
          className: `dnd5e_spell_filter_row`,
          children: [
            (0, b.jsx)(`button`, {
              className:
                s === null
                  ? `dnd5e_spell_filter_btn active`
                  : `dnd5e_spell_filter_btn`,
              onClick: () => c(null),
              children: `All`,
            }),
            ct.map((e, t) =>
              (0, b.jsx)(
                `button`,
                {
                  className:
                    s === t
                      ? `dnd5e_spell_filter_btn active`
                      : `dnd5e_spell_filter_btn`,
                  onClick: () => c(s === t ? null : t),
                  children: e,
                },
                t,
              ),
            ),
          ],
        }),
        p.length > 0 &&
          (0, b.jsxs)(`div`, {
            className: `dnd5e_spell_filter_row`,
            children: [
              (0, b.jsx)(`button`, {
                className:
                  l === null
                    ? `dnd5e_spell_filter_btn active`
                    : `dnd5e_spell_filter_btn`,
                onClick: () => u(null),
                children: `All Schools`,
              }),
              p.map((e) =>
                (0, b.jsx)(
                  `button`,
                  {
                    className:
                      l === e
                        ? `dnd5e_spell_filter_btn active`
                        : `dnd5e_spell_filter_btn`,
                    onClick: () => u(l === e ? null : e),
                    children: Ie[e] ?? e,
                  },
                  e,
                ),
              ),
            ],
          }),
        (0, b.jsxs)(`div`, {
          className: `dnd5e_item_search_results`,
          children: [
            t &&
              (0, b.jsx)(`div`, {
                className: `dnd5e_item_search_empty`,
                children: `Loading spell sources…`,
              }),
            n &&
              (0, b.jsxs)(`div`, {
                className: `dnd5e_item_search_empty`,
                children: [`Error: `, n],
              }),
            !t &&
              !n &&
              f.length === 0 &&
              (0, b.jsx)(`div`, {
                className: `dnd5e_item_search_empty`,
                children: `No spells found`,
              }),
            f.map((e, t) =>
              (0, b.jsxs)(
                `div`,
                {
                  className: `dnd5e_item_search_result`,
                  onClick: () => r(e),
                  children: [
                    (0, b.jsx)(`span`, {
                      className: `dnd5e_item_search_result_name`,
                      children: e.name,
                    }),
                    (0, b.jsxs)(`div`, {
                      className: `dnd5e_item_search_result_tags`,
                      children: [
                        (0, b.jsx)(`span`, {
                          className: `dnd5e_spell_search_level`,
                          children: ct[parseInt(e.level ?? 0, 10)],
                        }),
                        (0, b.jsx)(`span`, {
                          className: `dnd5e_spell_search_school`,
                          children: Ie[e.school] ?? e.school,
                        }),
                        e.meta?.ritual &&
                          (0, b.jsx)(`span`, {
                            className: `dnd5e_spell_search_badge`,
                            children: `R`,
                          }),
                        e.duration?.[0]?.concentration &&
                          (0, b.jsx)(`span`, {
                            className: `dnd5e_spell_search_badge dnd5e_spell_search_badge_conc`,
                            children: `C`,
                          }),
                        e.source &&
                          (0, b.jsx)(`span`, {
                            className: `dnd5e_spell_search_src`,
                            children: e.source,
                          }),
                      ],
                    }),
                  ],
                },
                e.name + (e.source ?? ``) + t,
              ),
            ),
          ],
        }),
      ],
    });
  },
  dt = ({ Api: e }) => {
    let [t, , n, r, i] = Ee([e, `spells`, !0]),
      { spells: a, loading: o, error: s, load: c } = st(e),
      [l, u] = _.useState(!1),
      [d, f] = _.useState(!1);
    return (0, b.jsxs)(`div`, {
      className: `dnd5e_spells_container`,
      children: [
        (0, b.jsxs)(`div`, {
          className: `dnd5e_inventory_toolbar`,
          children: [
            (0, b.jsxs)(`button`, {
              className: `dnd5e_inventory_search_btn`,
              onClick: () => {
                (c(), f(!0));
              },
              children: [(0, b.jsx)(_e, {}), ` Search Spells`],
            }),
            (0, b.jsx)(`button`, {
              className: `dnd5e_inventory_add_btn`,
              title: `Add blank spell`,
              onClick: () => {
                (n({
                  id: Fe(),
                  name: ``,
                  level: `1`,
                  school: `V`,
                  castingTime: `1 action`,
                  range: `60 ft.`,
                  duration: `Instantaneous`,
                  components: ``,
                  concentration: !1,
                  ritual: !1,
                  prepared: !1,
                  action: ``,
                  actionArgs: ``,
                  description: ``,
                  descHigher: ``,
                }),
                  u(!0));
              },
              children: (0, b.jsx)(ve, {}),
            }),
            (0, b.jsx)(`button`, {
              className: `dnd5e_inventory_edit_btn`,
              onClick: () => u((e) => !e),
              children: l ? `✓ Done` : `Edit`,
            }),
          ],
        }),
        d &&
          (0, b.jsx)(ut, {
            spellData: a,
            loading: o,
            error: s,
            onAdd: (e) => {
              (n(Ve(e)), f(!1));
            },
            onClose: () => f(!1),
          }),
        t.length === 0 &&
          !d &&
          (0, b.jsxs)(`div`, {
            className: `dnd5e_inventory_empty`,
            children: [
              (0, b.jsx)(`span`, { children: `No spells yet.` }),
              (0, b.jsx)(`span`, {
                className: `dnd5e_inventory_empty_sub`,
                children: `Search the SRD or add a blank spell above.`,
              }),
            ],
          }),
        t.length > 0 &&
          (0, b.jsxs)(`div`, {
            className: `dnd5e_spells_body`,
            children: [
              (0, b.jsxs)(`div`, {
                className: `dnd5e_spell_header`,
                children: [
                  (0, b.jsx)(`div`, {
                    className: `dnd5e_spell_col_prep`,
                    children: `Prep`,
                  }),
                  (0, b.jsx)(`div`, {
                    className: `dnd5e_spell_col_name`,
                    children: `Name`,
                  }),
                  (0, b.jsx)(`div`, {
                    className: `dnd5e_spell_col_level`,
                    children: `Lvl`,
                  }),
                  (0, b.jsx)(`div`, {
                    className: `dnd5e_spell_col_school`,
                    children: `School`,
                  }),
                  (0, b.jsx)(`div`, {
                    className: `dnd5e_spell_col_time`,
                    children: `Cast Time`,
                  }),
                  (0, b.jsx)(`div`, {
                    className: `dnd5e_spell_col_range`,
                    children: `Range`,
                  }),
                  (0, b.jsx)(`div`, {
                    className: `dnd5e_spell_col_duration`,
                    children: `Duration`,
                  }),
                  (0, b.jsx)(`div`, {
                    className: `dnd5e_spell_col_action`,
                    children: l ? `Action / Args` : `Action`,
                  }),
                  l &&
                    (0, b.jsx)(`div`, {
                      style: { width: `28px`, flexShrink: 0 },
                    }),
                ],
              }),
              t.map((t, n) =>
                (0, b.jsx)(
                  ft,
                  {
                    spell: t,
                    index: n,
                    edit: l,
                    removeSpell: r,
                    updateSpell: i,
                    Api: e,
                  },
                  t.id ?? `spell_` + n,
                ),
              ),
            ],
          }),
      ],
    });
  },
  ft = ({
    Api: e,
    spell: t,
    index: n,
    edit: r,
    removeSpell: i,
    updateSpell: a,
  }) => {
    let [o, s] = _.useState(!1),
      [c, l] = _.useState(t.name),
      [u, d] = _.useState(t.level ?? `0`),
      [f, p] = _.useState(t.school ?? `V`),
      [m, h] = _.useState(t.prepared ?? !1),
      [g, v] = _.useState(t.castingTime ?? `1 action`),
      [y, x] = _.useState(t.range ?? ``),
      [S, C] = _.useState(t.duration ?? ``),
      [w, ee] = _.useState(t.action ?? ``),
      [te, T] = _.useState(t.actionArgs ?? ``),
      E = (e = {}) =>
        a(n, {
          ...t,
          name: c,
          level: u,
          school: f,
          prepared: m,
          castingTime: g,
          range: y,
          duration: S,
          action: w,
          actionArgs: te,
          ...e,
        }),
      ne = Ie[f] ?? f,
      re = ct[parseInt(u, 10)] ?? u,
      ie = t.concentration,
      ae = t.ritual;
    return (0, b.jsxs)(`div`, {
      className: `dnd5e_spell_row_wrap${m ? ` dnd5e_spell_prepared` : ``}`,
      children: [
        (0, b.jsxs)(`div`, {
          className: `dnd5e_spell_row`,
          children: [
            (0, b.jsx)(`div`, {
              className: `dnd5e_spell_col_prep`,
              children: (0, b.jsx)(`input`, {
                type: `checkbox`,
                checked: m,
                onChange: (e) => {
                  (h(e.target.checked), E({ prepared: e.target.checked }));
                },
              }),
            }),
            (0, b.jsx)(`div`, {
              className: `dnd5e_spell_col_name`,
              children: r
                ? (0, b.jsx)(`input`, {
                    value: c,
                    placeholder: `Spell name`,
                    onChange: (e) => l(e.target.value),
                    onBlur: () => E(),
                  })
                : (0, b.jsxs)(`span`, {
                    className: `dnd5e_spell_name_btn`,
                    onClick: () => s((e) => !e),
                    children: [
                      o ? (0, b.jsx)(Te, {}) : (0, b.jsx)(we, {}),
                      c || (0, b.jsx)(`em`, { children: `unnamed` }),
                      ie &&
                        (0, b.jsx)(`span`, {
                          className: `dnd5e_spell_tag dnd5e_spell_tag_conc`,
                          children: `C`,
                        }),
                      ae &&
                        (0, b.jsx)(`span`, {
                          className: `dnd5e_spell_tag dnd5e_spell_tag_ritual`,
                          children: `R`,
                        }),
                    ],
                  }),
            }),
            (0, b.jsx)(`div`, {
              className: `dnd5e_spell_col_level`,
              children: r
                ? (0, b.jsx)(`input`, {
                    value: u,
                    onChange: (e) => d(e.target.value),
                    onBlur: () => E(),
                  })
                : (0, b.jsx)(`span`, { children: re }),
            }),
            (0, b.jsx)(`div`, {
              className: `dnd5e_spell_col_school`,
              children: r
                ? (0, b.jsx)(`input`, {
                    value: f,
                    onChange: (e) => p(e.target.value),
                    onBlur: () => E(),
                  })
                : (0, b.jsx)(`span`, { children: ne }),
            }),
            (0, b.jsx)(`div`, {
              className: `dnd5e_spell_col_time`,
              children: r
                ? (0, b.jsx)(`input`, {
                    value: g,
                    onChange: (e) => v(e.target.value),
                    onBlur: () => E(),
                  })
                : (0, b.jsx)(`span`, { children: g }),
            }),
            (0, b.jsx)(`div`, {
              className: `dnd5e_spell_col_range`,
              children: r
                ? (0, b.jsx)(`input`, {
                    value: y,
                    onChange: (e) => x(e.target.value),
                    onBlur: () => E(),
                  })
                : (0, b.jsx)(`span`, { children: y }),
            }),
            (0, b.jsx)(`div`, {
              className: `dnd5e_spell_col_duration`,
              children: r
                ? (0, b.jsx)(`input`, {
                    value: S,
                    onChange: (e) => C(e.target.value),
                    onBlur: () => E(),
                  })
                : (0, b.jsx)(`span`, { children: S }),
            }),
            (0, b.jsxs)(`div`, {
              className: `dnd5e_spell_col_action`,
              children: [
                r &&
                  (0, b.jsxs)(b.Fragment, {
                    children: [
                      (0, b.jsx)(`input`, {
                        placeholder: `Action name`,
                        value: w,
                        onChange: (e) => ee(e.target.value),
                        onBlur: () => E(),
                      }),
                      (0, b.jsx)(`input`, {
                        placeholder: `Args {"key":"val"}`,
                        value: te,
                        onChange: (e) => T(e.target.value),
                        onBlur: () => E(),
                      }),
                    ],
                  }),
                !r &&
                  (0, b.jsx)(`button`, {
                    className: `dnd5e_use_btn`,
                    onClick: () => {
                      let n = {
                          name: c,
                          level: u,
                          levelLabel: re,
                          school: f,
                          schoolLabel: ne,
                          castingTime: g,
                          range: y,
                          duration: S,
                          concentration: ie ?? !1,
                          ritual: ae ?? !1,
                          components: t.components ?? ``,
                          prepared: m,
                          description: t.description ?? ``,
                          descHigher: t.descHigher ?? ``,
                          source: t.source ?? ``,
                        },
                        r = w || `dnd5e/DisplaySpellDescription`;
                      e.FireAction(r, { ...n, ...lt(te) });
                    },
                    children: `Cast`,
                  }),
              ],
            }),
            r &&
              (0, b.jsx)(`button`, {
                className: `dnd5e_remove_btn`,
                onClick: () => i(n),
                children: (0, b.jsx)(ye, {}),
              }),
          ],
        }),
        o &&
          !r &&
          (0, b.jsxs)(`div`, {
            className: `dnd5e_spell_accordion`,
            children: [
              t.components &&
                (0, b.jsxs)(`div`, {
                  className: `dnd5e_spell_acc_row`,
                  children: [
                    (0, b.jsx)(`span`, {
                      className: `dnd5e_spell_acc_label`,
                      children: `Components`,
                    }),
                    (0, b.jsx)(`span`, { children: t.components }),
                  ],
                }),
              t.source &&
                (0, b.jsxs)(`div`, {
                  className: `dnd5e_spell_acc_row`,
                  children: [
                    (0, b.jsx)(`span`, {
                      className: `dnd5e_spell_acc_label`,
                      children: `Source`,
                    }),
                    (0, b.jsx)(`span`, { children: t.source }),
                  ],
                }),
              t.description &&
                (0, b.jsx)(`p`, {
                  className: `dnd5e_spell_acc_desc`,
                  children: je(t.description),
                }),
              t.descHigher &&
                (0, b.jsxs)(`p`, {
                  className: `dnd5e_spell_acc_higher`,
                  children: [
                    (0, b.jsx)(`strong`, { children: `At Higher Levels.` }),
                    ` `,
                    je(t.descHigher),
                  ],
                }),
            ],
          }),
      ],
    });
  };
function pt({ Api: e }) {
  let [t, n] = _.useState(null);
  return (
    _.useEffect(() => {
      (async () => {
        n(
          (await e.ClientMediator.sendCommandAsync(`Game`, `GetGameId`)) ??
            `fallback`,
        );
      })();
    }, [e]),
    t
      ? (0, b.jsx)(mt, { Api: e, gameId: t })
      : (0, b.jsx)(`div`, { className: `dnd5e_loading`, children: `Loading…` })
  );
}
function mt({ Api: e, gameId: t }) {
  let [n, r] = _.useState(void 0),
    [i, a] = _.useState(`stats`);
  return (
    console.log(`App component rendered with config:`, n),
    _.useEffect(() => {
      let n = ({ value: e }) => {
        r(JSON.parse(e));
      };
      return (
        (async () => {
          (e.Properties.Global.Subscribe(t, `dnd5e_config`, n),
            await e.Properties.Global.Init(
              t,
              `dnd5e_config`,
              JSON.stringify(D),
            ));
          let i = await e.Properties.Global.Get(t, `dnd5e_config`);
          i && r(JSON.parse(i.value));
        })(),
        () => {
          e.Properties.Global.Unsubscribe(t, `dnd5e_config`, n);
        }
      );
    }, [t]),
    n
      ? (0, b.jsxs)(`div`, {
          style: {
            display: `flex`,
            flexDirection: `column`,
            background: `var(--dnd-parchment)`,
            height: `100vh`,
            overflow: `hidden`,
          },
          children: [
            (0, b.jsx)(`div`, {
              className: `dnd5e_tabs`,
              children: [`stats`, `bio`, `spells`].map((e) =>
                (0, b.jsx)(
                  `div`,
                  {
                    className: `dnd5e_tab${i === e ? ` active` : ``}`,
                    onClick: () => a(e),
                    children: e.charAt(0).toUpperCase() + e.slice(1),
                  },
                  e,
                ),
              ),
            }),
            (0, b.jsxs)(`div`, {
              style: {
                display: i === `stats` ? `flex` : `none`,
                flexDirection: `row`,
                padding: `8px`,
                gap: `6px`,
                flexWrap: `wrap`,
                flex: 1,
                overflowY: `auto`,
              },
              children: [
                (0, b.jsxs)(`div`, {
                  style: { display: `flex`, flexDirection: `column` },
                  children: [
                    (0, b.jsx)(le, { Api: e }),
                    (0, b.jsx)(O, { attributesList: n.attributes, Api: e }),
                    (0, b.jsx)(nt, { Api: e }),
                  ],
                }),
                (0, b.jsxs)(`div`, {
                  style: {
                    display: `flex`,
                    flexDirection: `column`,
                    flex: 1,
                    minWidth: 0,
                  },
                  children: [
                    (0, b.jsx)(de, { Api: e }),
                    (0, b.jsxs)(`div`, {
                      style: {
                        display: `flex`,
                        flexDirection: `row`,
                        flexWrap: `wrap`,
                      },
                      children: [
                        (0, b.jsx)(fe, { Api: e }),
                        (0, b.jsx)(me, {
                          Api: e,
                          propertyName: `armor`,
                          label: `Armor Class`,
                        }),
                        (0, b.jsx)(me, {
                          Api: e,
                          propertyName: `initiative`,
                          label: `Initiative`,
                          rollLabel: `Roll`,
                          rollOnClick: () => {},
                        }),
                        (0, b.jsx)(me, {
                          Api: e,
                          propertyName: `speed`,
                          label: `Speed`,
                        }),
                      ],
                    }),
                    (0, b.jsxs)(`div`, {
                      style: {
                        display: `flex`,
                        flexDirection: `row`,
                        flexWrap: `wrap`,
                        alignItems: `flex-start`,
                      },
                      children: [
                        (0, b.jsx)(j, { Api: e, attributesList: n.attributes }),
                        (0, b.jsx)(he, { Api: e }),
                      ],
                    }),
                    (0, b.jsxs)(`div`, {
                      style: {
                        display: `flex`,
                        flexDirection: `row`,
                        flexWrap: `wrap`,
                        alignItems: `flex-start`,
                      },
                      children: [
                        (0, b.jsx)(pe, { Api: e, skills: n.skills }),
                        (0, b.jsxs)(`div`, {
                          style: {
                            display: `flex`,
                            flexDirection: `column`,
                            flexGrow: 1,
                            flexBasis: 0,
                            minWidth: 0,
                          },
                          children: [
                            (0, b.jsx)(ge, { Api: e }),
                            (0, b.jsx)(Ze, { Api: e }),
                            (0, b.jsx)(Ge, { Api: e }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            (0, b.jsx)(`div`, {
              style: {
                display: i === `bio` ? `flex` : `none`,
                flexDirection: `column`,
                flex: 1,
                overflowY: `auto`,
              },
              children: (0, b.jsx)(at, { Api: e }),
            }),
            (0, b.jsx)(`div`, {
              style: {
                display: i === `spells` ? `flex` : `none`,
                flexDirection: `column`,
                flex: 1,
                padding: `8px`,
                minHeight: 0,
              },
              children: (0, b.jsx)(dt, { Api: e }),
            }),
          ],
        })
      : (0, b.jsx)(`div`, {
          className: `dnd5e_loading`,
          children: `Loading character…`,
        })
  );
}
var ht = (0, v.createRoot)(document.getElementById(`root`));
window.addEventListener(
  `cardapi:ready`,
  () => {
    let e = window.CardAPI;
    ht.render(
      (0, b.jsx)(_.StrictMode, {
        children: (0, b.jsx)(pt, {
          Api: e,
          additionalArguments: e.additionalArguments,
        }),
      }),
    );
  },
  { once: !0 },
);
