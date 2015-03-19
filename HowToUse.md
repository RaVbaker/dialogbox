# HowTo dla Dialogbox (pl) #

<p>Tak, wiem - pomysł ulepszania domyślnych przeglądarkowych komunikatów do najnowszych nie należy, ale poświęccie mi chociaż chwilę. Przecież dobrze wiemy, że pomysł nie musi być świeży - grunt, żeby wykonanie było wnoszące świeży powiew.</p>

<p>W <a href='http://www.nokaut.pl' title='Nokaut.pl'>firmie</a> w której pracuje rozwiązaniem, które do tej pory stosowaliśmy była stara wersja Control.Modala bazująca na ładowaniu contentu do iframe'a. Obecnie, autor tamtej biblioteki nieco ją rozbudował i być może obecnie wykorzystanie jej byłoby łatwiejsze niż gdy było implementowane tamto rozwiązanie. Tyle, że niepotrzebna z reguły jest aż taka konfiguracja, na jaką pozwala twórca <a href='http://livepipe.net/control/window'>Control.Window</a>. Mój pomysł bardziej jest zbliżony do tego znanego np. z <a href='http://last.fm'>last.fm</a>, czy <a href='http://facebook.com'>facebook.com</a>.</p>


<p>W podstawowej wersji biblioteka zakłada, że treść załadowana do niej pochodzi, bądź z ajaksowego żądania, albo jest po prostu statycznym kawałkiem tekstu w wiadomości z tytułem, akceptującym dwie akcje: OK i Cancel. Dlaczego tak? Ano dlatego, że podstawową funkcją tych okienek jest interakcja. Tak, więc jest to idealne rozwiązanie do zastąpienia okienek typu <pre><code>confirm("Are you sure?")</code></pre>, czy <pre><code>alert("This action is invalid!")</code></pre>.<br>
</p>

<p>Jak w mojej bibliotece przygotować poniższe okienka? Bardzo prostu - dodając uruchomienie okna w przestrzeni nazw <em>DialogBox</em></p>
```
DialogBox.confirm("Are you sure?", function(){
/* uruchomione w przypadku sukcesu */
}, function(){
/* uruchomione w przypadku porażki */
});```
```
DialogBox.alert("Warning!?!");```

<p>Prawda, że proste? O parametryzacji tego typu wywołań powiem później. Natomiast, tym, co nas może zainteresować, to pobranie zawartości wiadmości za pomocą Ajaksa. Nic prostszego, argument z treścią wiadomości wystarczy zastąpić adresem do żądania ajax, czyli zaczynającym się dla adresów bezwzględnych od "http://" lub od znaku "/" w obrębie bieżącej domeny:</p>
```

DialogBox.alert("/DynamicMessages/alert/toLowPrice");
```

<p>Okienko może oczywiście posiadać także pasek tytułowy - wówczas jest on drugim argumentem dla funkcji inicjującej:</p>
```

DialogBox.alert("Don't do it at home", "Warning!!!");
```

<p>Oczywiście <em>wbudowane</em> typy okienek, typu alert, confirm, info, czy debug, to nie jedyne możliwe opcje. Można samemu zdefiniować sobie kompletny wygląd okienka, tworząc je w sposób obiektowy z javascriptowej klasy DialogBox:</p>
```

new DialogBox("/my/url/to/ajax/file.html", "Very interesting information in my style", {classNames: "myDialogBoxStyleClass", on_ok_reload: true, cancel_enable: false, show_wrapper: false, ok_value: "Push me - I'm a button!"});
```

<p>Pewnie ciekawi was, jakie parametry można stosować. Śpieszę z wyjaśnieniem:<br>
</p>
<dl>
<blockquote><dt>classNames</dt>
<dd>Zawartość tego parametru będzie wstawiana do głównego elementu okalającego całe okienko. Dlatego używać go można do własnoręcznego ostylowywania okienka. </dd>
<dt>method</dt><dd>Ten atrybut jest metodą wysłania formularza po wciśnięciu przycisku &lt;OK&gt;. Domyślnie: 'post'</dd>
<dt>submit_url</dt><dd>Alternatywny adres wysłania formularza. Użyteczny zwłaszcza wtedy, gdy chcemy wykonać submit formularza przyciskiem &lt;OK&gt; ale treść wstawiliśmy statycznie.</dd>
<dt>ok_value</dt><dd>Etykieta przycisku zatwierdzającego akcję. Domyślnie: 'OK'</dd>
<dt>cancel_value</dt><dd>Etykieta przycisku anulującego akcję. Domyślnie: 'Anuluj'</dd>
<dt>ok_callback</dt><dd>Pod tę zmienną można podpiąć funkcję wykonywaną po wciśnięciu przycisku &lt;OK&gt;. Domyślnie: Prototype.emptyFunction</dd>
<dt>cancel_callback</dt><dd>Pod tę zmienną można podpiąć funkcję wykonywaną po wciśnięciu przycisku &lt;Anuluj&gt;. Domyślnie: function() { this.close(); }</dd>
<dt>close_callback</dt><dd>Funkcja wykonywana po wciśnięciu przycisku &lt;X&gt; w górnym prawym rogu okienka. Domyślnie: Prototype.emptyFunction</dd>
<dt>cancel_enable</dt><dd>Ustawiony na false spowoduje, że przycisk &lt;Anuluj&gt; się nie pojawi.</dd>
<dt>ok_enable</dt><dd>Ustawiony na false spowoduje, że przycisk &lt;Ok&gt; się nie pojawi.</dd>
<dt>actions_enable</dt><dd>Ustawiony na false spowoduje, że cały panel (domyślnie szary) na którym znajdują się przyciski &lt;OK&gt; i &lt;Anuluj&gt; się nie pojawi.</dd>
<dt>effects_enable</dt><dd>Ustawiony na false spowoduje, że nawet w przypadku dostępności funkcji z biblioteki scriptaculous, wszelkie akcje, takie jak zamykanie okienka, czy przesuwanie; będą wyłączone.</dd>
<dt>standalone</dt><dd>Ustawiony na true spowoduje, że okienko będzie pozbawione możliwości przesuwania.</dd>
<dt>type</dt><dd>Parametr ten odpowiada, za typ okienka. Domyślnie: 'auto'. Możliwe typy:<br>
<blockquote><dl>
<dt>'ajax'</dt> <dd>zawartość okienka pobierana ajaxem na podstawie pierwszego argumentu - adresu,</dd>
<dt>'text'</dt> <dd>zawartość okienka jest statycznym tekstem i wstawiana bezpośrednio wewnątrz okienka,</dd>
<dt>'image'</dt> <dd>zawartość okienka jest podglądem obrazka i do okienka zostaje załadowany obrazek spod adresu z pierwszego argumentu,</dd>
<dt>'auto'</dt> <dd>automatyczna detekcja typu okienka na podstawie pierwszego argumentu.</dd>
</dl>
</blockquote><blockquote></dd>
</blockquote><dt>on_ok_reload</dt><dd>Ustawiony na true spowoduje, że bieżąca strona po naciśnięciu przycisku &lt;OK&gt; zostanie przeładowana.</dd>
<dt>show_wrapper</dt><dd>Ustawiony na false spowoduje, że szare tło pod okienkiem nie wyświetli się.</dd>
<dt>wrapper_clickable</dt><dd>Ustawiony na false spowoduje, że kliknięcie szarego tła pod okienkiem nie zamknie dialogboksa</dd>
<dt>after_load_callback</dt><dd>Funkcja uruchamiana bezpośrednio po załadowaniu okienka(czy to z ajaksa, czy wstawieniu kodu HTML statycznej). Domyślnie: Prototype.emptyFunction</dd>
</dl></blockquote>


