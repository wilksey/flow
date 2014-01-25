define(['jquery', 'app/view', 'util/all', 'text!./template.html', 'text!./stylesheet.css'], function ($, View, Util, template, styles) {

  Util.Sound.registerSound({id: "tick", src: "themes/chronometer/sounds/tick.wav"});
  Util.Sound.registerSound({id: "done", src: "themes/chronometer/sounds/done.wav"});

  var _unitsToTime = function (units, precision) {
    var ss = Math.floor(units / precision) % 60,
        mm = Math.floor(units / (60 * precision));

    return (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss;
  };

  var _color = function (status, percent) {
    var from = (status == 'breaking') ? "#898F96" : "#5EAE22",
        to = (status == 'breaking') ? "#206EC8" : "#E7522D",
        total = 100 * 100,
        k = percent * 100;

    return Util.Color.interpolate(from, to, total, k);
  }

  var _scale = function (percent) {
    return (100 - (percent / 2)) / 100;
  }

  var _presenter = function (view) {
    var f = view.flow,
        status = f.status(),
        percent = Math.round((f.units / f.limit) * 100000) / 1000,
        secondsLeft = (f.limit - f.units) / 1000,
        time = (status == 'breaking' && percent > 0 ? '-' : ''    ) + _unitsToTime(f.count(), f.unitSize),
        text = (status == 'working' && percent > 0) ? 'Rest' : 'Work',
        color = _color(status, percent),
        scale = _scale(percent);

    return  {status: status, time: time, color: color, scale: scale, buttonText: text, secondsLeft: secondsLeft};
  }

  var _changeTitle = function (time) {
    window.document.title = "Flow" + " (" + time + ")";
  }

  var Chronometer  = View.extend({

    draw: function() {
      var presenter = _presenter(this);
      $('#container').html(Util.render(template, presenter, {styles: styles}));
      _changeTitle(presenter.time);
    },

    installHandlers: function () {
      $(document).on("click", '.button', function (e) {
        $(this).trigger('flow.switchRequested');
      });
    },

    refresh: function(){
      var presenter = _presenter(this),
          scale     = presenter.scale;

      $('.chronometer').css({'background-color' : presenter.color,
                             '-webkit-transform': 'scale('+ scale + ','+ scale +')',
                             'transform'        : 'scale('+ scale + ','+ scale +')'});

      $('.chronometer span').html(presenter.time);
      $('.button').html(presenter.buttonText);
      $('body').removeClass();
      $('body').addClass(presenter.status);

      _changeTitle(presenter.time);
    },

    limitReached: function(){
      Util.Sound.play('done');
    },

    zeroReached: function(){
      $('body').removeClass();
      Util.Sound.play('tick');
    }
  });

  return Chronometer;
});