module.exports = function( grunt ) {

  var path_prod = 'public/';
  var path_src = 'src/';
 
  var dev_js    = path_src  + 'js/'; //diretório do js desenvolvimento
  var dev_less  = path_src  + 'less/'; //diretório do less desenvolvimento
  var prod_css  = path_prod + 'stylesheets/';
  var prod_js   = path_prod + 'javascripts/';

  grunt.initConfig({
    uglify: {
      my_target: {
        files: grunt.file.expandMapping([dev_js+'*.js'], prod_js, {
            rename: function(destBase, destPath) {
                var fileName = destPath.replace(dev_js,'');
                return destBase+fileName.replace('.js', '.min.js');
            }
        })
      }
    }, //uglify

    less: {
      development: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2
        },
        files: grunt.file.expandMapping([ dev_less+'*.less'], prod_css, {
            rename: function(destBase, destPath) {
                var fileName = destPath.replace(dev_less,'');
                return destBase+fileName.replace('.less', '.min.css');
            }
        })
      }
    }, // less

    watch: {
      less: {
        files: [dev_less +'**/*.less'],
        tasks: ['less'],
        options: {
          nospawn: true,
          livereload: true
        }
      },
      js: {
        files: [dev_js+'*.js'],
        tasks: ['uglify'],
        options: {
          livereload: true
        }
      }
    }, // watch
 
  });

  // Plugins do Grunt
  grunt.loadNpmTasks( 'grunt-contrib-uglify' );
  grunt.loadNpmTasks( 'grunt-contrib-less' );
  grunt.loadNpmTasks( 'grunt-contrib-watch' );
 
  // Tarefas que serão executadas
  grunt.registerTask( 'default', [ 'uglify', 'less' ] );
 
};